const express = require('express');
const verifyJWT = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require JWT and admin role
router.use(verifyJWT, requireAdmin);

// Users
router.get('/users', adminController.getUsers);

// API Keys
router.get('/apikeys', adminController.getApiKeys);
router.patch('/apikeys/:keyId/revoke', adminController.revokeApiKey);
router.delete('/apikeys/:keyId', adminController.deleteApiKey);

// Faces
router.get('/faces', adminController.getFaces);
router.delete('/faces/:faceId', adminController.deleteFace);

// Logs
router.get('/logs', adminController.getLogs);

module.exports = router;