const { Op } = require('sequelize');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const RegisteredFace = require('../models/RegisteredFace');
const RecognitionLog = require('../models/RecognitionLog');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};


exports.getApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.findAll({ order: [['createdAt','DESC']] });
    res.status(200).json({ keys });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const key = await ApiKey.findByPk(keyId);
    if (!key) return res.status(404).json({ message: 'API key not found' });
    key.isActive = false;
    await key.save();
    res.status(200).json({ message: 'API key revoked' });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const key = await ApiKey.findByPk(keyId);
    if (!key) return res.status(404).json({ message: 'API key not found' });
    await RecognitionLog.destroy({ where: { apiKeyId: keyId } });
    await key.destroy();
    res.status(200).json({ message: 'API key deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

exports.getFaces = async (req, res) => {
  try {
    const { userId } = req.query;
    const where = userId ? { userId } : {};
    const faces = await RegisteredFace.findAll({ where, order: [['createdAt','DESC']] });
    res.status(200).json({ faces });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

exports.deleteFace = async (req, res) => {
  try {
    const { faceId } = req.params;
    const face = await RegisteredFace.findByPk(faceId);
    if (!face) return res.status(404).json({ message: 'Face not found' });
    await face.destroy();
    res.status(200).json({ message: 'Face deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};

exports.getLogs = async (req, res) => {
  try {
    const { limit = 50, skip = 0, userId } = req.query;
    const where = userId ? { userId } : {};
    const logs = await RecognitionLog.findAll({ where, order: [['createdAt','DESC']], limit: parseInt(limit), offset: parseInt(skip) });
    const total = await RecognitionLog.count({ where });

    // Attach usernames for convenience (without defining associations)
    const userIds = [...new Set(logs.map(l => l.userId))];
    let usersMap = {};
    if (userIds.length > 0) {
      const users = await User.findAll({ where: { id: userIds }, attributes: ['id','username','fullName','email'] });
      users.forEach(u => { usersMap[u.id] = u; });
    }
    const enriched = logs.map(l => {
      const json = l.toJSON();
      const u = usersMap[l.userId];
      return { ...json, username: u ? u.username : null, user: u ? u : null };
    });

    res.status(200).json({ logs: enriched, total });
  } catch (err) { res.status(500).json({ message: 'Server error: ' + err.message }); }
};
