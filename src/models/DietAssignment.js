import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DietAssignment = sequelize.define('DietAssignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dietId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  trainerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default DietAssignment;
