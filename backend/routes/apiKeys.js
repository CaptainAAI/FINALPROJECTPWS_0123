const express = require('express');
const apiKeyController = require('../controllers/apiKeyController');
const verifyJWT = require('../middleware/auth');

const router = express.Router();

// All routes require JWT authentication
router.use(verifyJWT);

// API Key management routes
router.post('/generate', apiKeyController.generateApiKey);
router.get('/', apiKeyController.getApiKeys);
router.get('/:keyId', apiKeyController.getApiKeyDetails);
router.delete('/:keyId', apiKeyController.deleteApiKey);
router.patch('/:keyId/revoke', apiKeyController.revokeApiKey);
router.patch('/:keyId/activate', apiKeyController.activateApiKey);

module.exports = router;
