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
