const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RegisteredFace = sequelize.define('RegisteredFace', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Face 1'
  },
  embedding: {
    type: DataTypes.JSON,
    allowNull: false
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true
  },
  confidence: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'registered_faces',
  timestamps: true
});

module.exports = RegisteredFace;
