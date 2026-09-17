import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WorkoutAssignment = sequelize.define('WorkoutAssignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  trainerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workoutId: {
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

export default WorkoutAssignment;
