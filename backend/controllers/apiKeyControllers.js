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
