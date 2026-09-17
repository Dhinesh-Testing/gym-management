import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MembershipPlan = sequelize.define('MembershipPlan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  durationtype: {
    type: DataTypes.ENUM('Days', 'Months', 'Years'),
    allowNull: false,
    defaultValue: 'Months',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  registrationfee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  offerprice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  timestamps: true,
});

export default MembershipPlan;
