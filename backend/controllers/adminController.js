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
