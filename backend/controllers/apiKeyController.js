const ApiKey = require('../models/ApiKey');
const RecognitionLog = require('../models/RecognitionLog');

// Generate new API key
exports.generateApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    // Generate key
    const key = ApiKey.generateKey();

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create API key record
    const apiKey = await ApiKey.create({
      key,
      userId,
      name: name || 'API Key ' + new Date().toLocaleDateString(),
      expiresAt
    });

    return res.status(201).json({
      message: 'API key generated successfully',
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        name: apiKey.name,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all API keys for user
exports.getApiKeys = async (req, res) => {
  try {
    const userId = req.userId;

    const apiKeys = await ApiKey.findAll({ 
      where: { userId },
      attributes: { exclude: ['key'] }
    });

    return res.status(200).json({ apiKeys });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Revoke API key
exports.revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.userId;

    const apiKey = await ApiKey.findOne({ where: { id: keyId, userId } });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    apiKey.isActive = false;
    await apiKey.save();

    return res.status(200).json({ message: 'API key revoked successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Reactivate API key
exports.activateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.userId;

    const apiKey = await ApiKey.findOne({ where: { id: keyId, userId } });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    apiKey.isActive = true;
    await apiKey.save();

    return res.status(200).json({ message: 'API key activated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get API key details (including full key for copy purposes)
exports.getApiKeyDetails = async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.userId;

    const apiKey = await ApiKey.findOne({ where: { id: keyId, userId } });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    return res.status(200).json({ apiKey });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Delete API key
exports.deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const userId = req.userId;

    // Clean up dependent logs first to avoid FK constraint errors
    await RecognitionLog.destroy({ where: { apiKeyId: keyId, userId } });

    const result = await ApiKey.destroy({ where: { id: keyId, userId } });

    if (result === 0) {
      return res.status(404).json({ message: 'API key not found' });
    }

    return res.status(200).json({ message: 'API key deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
