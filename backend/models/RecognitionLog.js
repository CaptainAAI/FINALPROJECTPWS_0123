const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RecognitionLog = sequelize.define('RecognitionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  apiKeyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'api_keys',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'error'),
    defaultValue: 'success'
  },
  imagePath: DataTypes.STRING,
  matchedFaces: DataTypes.INTEGER,
  duration: DataTypes.INTEGER,
  errorMessage: DataTypes.TEXT,
  matchedFaceId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  matchedFaceName: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'recognition_logs',
  timestamps: true
});

module.exports = RecognitionLog;
