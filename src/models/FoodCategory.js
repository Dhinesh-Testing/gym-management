import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FoodCategory = sequelize.define('FoodCategory', {
  categoryid: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  categoryname: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

export default FoodCategory;
