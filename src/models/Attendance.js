import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
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
  checkInTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  checkOutTime: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  timestamps: true,
});

export default Attendance;
