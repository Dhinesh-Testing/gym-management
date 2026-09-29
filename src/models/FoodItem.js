import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FoodItem = sequelize.define('FoodItem', {
  foodid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  foodname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoryid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
});

export default FoodItem;
