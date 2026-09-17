import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Diet = sequelize.define('Diet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  session: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'eveningsnack', 'dinner'),
    allowNull: false,
  },
  foodName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isQuantity: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isGrams: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  grams: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default Diet;
