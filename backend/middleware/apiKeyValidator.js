const ApiKey = require('../models/ApiKey');

// Middleware to validate API key
const validateApiKey = async (req, res, next) => {
	const apiKey = req.headers['x-api-key'];

	if (!apiKey) {
		return res.status(401).json({ message: 'API key is required' });
	}

	try {
		// Find the API key in the database
		const keyRecord = await ApiKey.findOne({ where: { key: apiKey } });

		if (!keyRecord) {
			return res.status(401).json({ message: 'Invalid API key' });
		}

		// Check if key is active
		if (!keyRecord.isActive) {
			return res.status(401).json({ message: 'API key is inactive' });
		}

		// Check if key has expired
		if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
			return res.status(401).json({ message: 'API key has expired' });
		}

		// Update last used time and usage count
		keyRecord.lastUsed = new Date();
		keyRecord.usageCount += 1;
		await keyRecord.save();

		// Attach key info to request
		req.apiKey = keyRecord;
		req.userId = keyRecord.userId;

		next();
	} catch (error) {
		return res.status(500).json({ message: 'Server error validating API key' });
	}
};

module.exports = validateApiKey;

