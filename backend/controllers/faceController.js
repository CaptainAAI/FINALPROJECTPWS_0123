const RegisteredFace = require('../models/RegisteredFace');
const fs = require('fs');

// Get all registered faces
exports.getAll = async (req, res) => {
  try {
    const userId = req.userId;

    const faces = await RegisteredFace.findAll({
      where: { userId, isActive: true },
      attributes: { exclude: ['embedding', 'imagePath'] },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ faces });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
