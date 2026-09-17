import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilephoto: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateofbirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true,
  },
  emergency: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bloodgroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fitnessgoal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assignedtrainer: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  membershipplanid: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  joiningdate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  }
}, {
  timestamps: true,
});

export default Member;
