import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'UPI'),
    defaultValue: 'cash',
  },
  paymentscreenshot: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transactionid: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
});

export default Payment;
