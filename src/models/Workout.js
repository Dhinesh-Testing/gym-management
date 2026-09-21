import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Workout = sequelize.define('Workout', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetmuscle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  difficultlevel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  workoutimage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sets: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reps: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  resttime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  trainerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Workout;
