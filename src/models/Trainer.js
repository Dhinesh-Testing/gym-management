import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Trainer = sequelize.define('Trainer', {
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
  speciality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shifttiming: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  monthlysalary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  }
}, {
  timestamps: true,
});

export default Trainer;
