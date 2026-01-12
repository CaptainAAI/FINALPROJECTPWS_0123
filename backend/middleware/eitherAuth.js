const verifyJWT = require('./auth');
const validateApiKey = require('./apiKeyValidator');

// Middleware that accepts either a valid JWT or a valid API key
module.exports = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const authHeader = req.headers.authorization;

  if (apiKeyHeader) {
    // Use API key validator (sets req.userId and req.apiKey)
    return validateApiKey(req, res, next);
  }

  if (authHeader) {
    // Use JWT validator (sets req.userId)
    return verifyJWT(req, res, next);
  }

  return res.status(401).json({ message: 'Provide API key (x-api-key) or JWT (Authorization: Bearer ...)' });
};
