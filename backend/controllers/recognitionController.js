const RecognitionLog = require('../models/RecognitionLog');
const RegisteredFace = require('../models/RegisteredFace');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper function to call Python service
const callPythonService = (command, args) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../face_recognition_service.py'),
      command,
      ...args
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // Some InsightFace logs may hit stdout; try last JSON-looking line
          const trimmed = output.trim();
          const lastLine = trimmed.split(/\r?\n/).filter(Boolean).pop() || '{}';
          resolve(JSON.parse(lastLine));
        } catch (e) {
          console.error('Python raw output:', output);
          console.error('Python stderr:', error);
          reject(new Error('Failed to parse Python output'));
        }
      } else {
        reject(new Error(error || 'Python service failed'));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
};

// Helper function to calculate similarity between two embeddings
const calculateSimilarity = (emb1, emb2) => {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < emb1.length; i++) {
    dotProduct += emb1[i] * emb2[i];
    norm1 += emb1[i] * emb1[i];
    norm2 += emb2[i] * emb2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Small helpers for reuse
const safeUnlink = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {});
    }
  } catch (_) {}
};

const extractEmbedding = async (imagePath) => {
  const result = await callPythonService('extract', [imagePath]);
  if (result.error) throw new Error(result.error);
  return { embedding: result.embedding, confidence: result.confidence };
};

const findBestMatch = (uploadedEmbedding, faces, threshold) => {
  let bestMatch = null;
  let totalMatches = 0;
  faces.forEach((face) => {
    const similarity = calculateSimilarity(uploadedEmbedding, face.embedding);
    if (similarity >= threshold) {
      totalMatches += 1;
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = {
          faceId: face.id,
          faceName: face.name,
          similarity: parseFloat(similarity.toFixed(4))
        };
      }
    }
  });
  return { bestMatch, totalMatches };
};

// Register user's face
exports.registerFace = async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Extract face embedding
    let result;
    try {
      result = await extractEmbedding(req.file.path);
    } catch (e) {
      safeUnlink(req.file?.path);
      return res.status(400).json({ message: e.message });
    }

    // Store face embedding in database
    const registeredFace = await RegisteredFace.create({
      userId,
      name: name || 'Registered Face',
      embedding: result.embedding,
      imagePath: req.file.path,
      confidence: result.confidence
    });

    return res.status(201).json({
      message: 'Face registered successfully',
      face: {
        id: registeredFace.id,
        name: registeredFace.name,
        confidence: registeredFace.confidence,
        createdAt: registeredFace.createdAt
      }
    });
  } catch (error) {
    console.error('Face registration error:', error);
    
    if (req.file) safeUnlink(req.file.path);

    return res.status(500).json({ 
      message: 'Face registration error: ' + error.message 
    });
  }
};

// Get all registered faces
exports.getRegisteredFaces = async (req, res) => {
  try {
    const userId = req.userId;

    const faces = await RegisteredFace.findAll({
      where: { userId, isActive: true },
      attributes: { exclude: ['embedding', 'imagePath'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ faces });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};


// Verify face against specific registered face
exports.verifyFace = async (req, res) => {
  try {
    const startTime = Date.now();
    const userId = req.userId;
    const apiKeyId = req.apiKey.id;
    const { faceId, threshold = 0.6 } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!faceId) {
      return res.status(400).json({ message: 'Face ID is required' });
    }

    // Get registered face
    const registeredFace = await RegisteredFace.findOne({
      where: { id: faceId, userId, isActive: true }
    });

    if (!registeredFace) {
      return res.status(404).json({ message: 'Registered face not found' });
    }

    // Extract embedding from uploaded image
    let uploadedEmbedding;
    try {
      const r = await extractEmbedding(req.file.path);
      uploadedEmbedding = r.embedding;
    } catch (e) {
      safeUnlink(req.file?.path);
      return res.status(400).json({ message: e.message });
    }

    // Calculate similarity
    const similarity = calculateSimilarity(
      uploadedEmbedding,
      registeredFace.embedding
    );

    const isMatch = similarity >= threshold;

    // Log verification
    const log = await RecognitionLog.create({
      apiKeyId,
      userId,
      status: isMatch ? 'success' : 'failed',
      matchedFaces: isMatch ? 1 : 0,
      imagePath: req.file.path,
      matchedFaceId: isMatch ? registeredFace.id : null,
      matchedFaceName: isMatch ? registeredFace.name : null,
      duration: Date.now() - startTime
    });

    // Clean up uploaded file
    safeUnlink(req.file?.path);

    return res.status(200).json({
      message: isMatch ? 'Face verified successfully' : 'Face verification failed',
      result: {
        verified: isMatch,
        similarity: parseFloat(similarity.toFixed(4)),
        threshold: threshold,
        registeredFaceName: registeredFace.name,
        duration: log.duration,
        timestamp: log.createdAt
      }
    });
  } catch (error) {
    console.error('Face verification error:', error);

    if (req.file) safeUnlink(req.file.path);

    return res.status(500).json({ 
      message: 'Face verification error: ' + error.message 
    });
  }
};
