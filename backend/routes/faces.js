const express = require('express');
const faceController = require('../controllers/faceController');
const verifyJWT = require('../middleware/auth');

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// Get all registered faces
router.get('/', faceController.getAll);

// Get single registered face
router.get('/:faceId', faceController.getOne);

// Update face name
router.patch('/:faceId', faceController.update);

// Delete registered face
router.delete('/:faceId', faceController.delete);

// Deactivate face
router.patch('/:faceId/deactivate', faceController.deactivate);

// Reactivate face
router.patch('/:faceId/reactivate', faceController.reactivate);

module.exports = router;
