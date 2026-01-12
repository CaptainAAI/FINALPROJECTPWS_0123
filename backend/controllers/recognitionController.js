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
