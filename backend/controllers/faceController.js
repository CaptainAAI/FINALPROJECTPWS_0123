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

// Get single registered face
exports.getOne = async (req, res) => {
  try {
    const { faceId } = req.params;
    const userId = req.userId;

    const face = await RegisteredFace.findOne({
      where: { id: faceId, userId, isActive: true },
      attributes: { exclude: ['embedding'] }
    });

    if (!face) {
      return res.status(404).json({ message: 'Face not found' });
    }

    return res.status(200).json({ face });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
