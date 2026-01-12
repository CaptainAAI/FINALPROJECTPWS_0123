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

// Update registered face name
exports.update = async (req, res) => {
  try {
    const { faceId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const face = await RegisteredFace.findOne({
      where: { id: faceId, userId, isActive: true }
    });

    if (!face) {
      return res.status(404).json({ message: 'Face not found' });
    }

    face.name = name;
    await face.save();

    return res.status(200).json({
      message: 'Face updated successfully',
      face: {
        id: face.id,
        name: face.name,
        createdAt: face.createdAt,
        updatedAt: face.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Delete registered face
exports.delete = async (req, res) => {
  try {
    const { faceId } = req.params;
    const userId = req.userId;

    const face = await RegisteredFace.findOne({
      where: { id: faceId, userId }
    });

    if (!face) {
      return res.status(404).json({ message: 'Face not found' });
    }

    // Delete image file if exists
    if (face.imagePath && fs.existsSync(face.imagePath)) {
      fs.unlink(face.imagePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    await face.destroy();

    return res.status(200).json({ message: 'Face deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
};
