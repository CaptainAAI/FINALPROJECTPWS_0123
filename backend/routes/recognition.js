const express = require('express');
const recognitionController = require('../controllers/recognitionController');
const validateApiKey = require('../middleware/apiKeyValidator');
const verifyJWT = require('../middleware/auth');
const eitherAuth = require('../middleware/eitherAuth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

// Public route: Detect & Identify (API key)
router.post('/detect', validateApiKey, upload.single('image'), recognitionController.detectFaces);

// Face Registration
router.post('/register', eitherAuth, upload.single('image'), recognitionController.registerFace);
router.get('/registered', eitherAuth, recognitionController.getRegisteredFaces);

router.delete('/registered/:faceId', eitherAuth, recognitionController.deleteRegisteredFace);

// Get logs (require JWT)
router.get('/logs', verifyJWT, recognitionController.getLogs);

module.exports = router;
