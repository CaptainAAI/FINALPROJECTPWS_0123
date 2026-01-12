const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const sequelize = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	key: {
		type: DataTypes.STRING(64),
		allowNull: false,
		unique: true,
		index: true
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
		defaultValue: 'Default Key'
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	lastUsed: {
		type: DataTypes.DATE,
		allowNull: true
	},
	usageCount: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	},
	expiresAt: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	tableName: 'api_keys',
	timestamps: true
});

ApiKey.generateKey = function() {
	return crypto.randomBytes(32).toString('hex');
};

module.exports = ApiKey;

