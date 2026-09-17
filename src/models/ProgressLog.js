import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProgressLog = sequelize.define('ProgressLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bodyFat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  muscleMass: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  chest: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  waist: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  arms: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  thighs: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  targetWeight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

export default ProgressLog;
