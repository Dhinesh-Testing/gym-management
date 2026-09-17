import db from '../models/index.js';
import fs from 'fs';
import path from 'path';

const { Payment, Member } = db;

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: {
        model: Member,
        attributes: ["id", "fullname"]
      }
    });
    res.json({ status: 200, data: payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: {
        model: Member,
        attributes: {
          exclude: ["password"]
        }
      }
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ status: 200, data: payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Handle paymentscreenshot update or removal
    if (req.body.paymentscreenshot === 'null' || req.body.paymentscreenshot === null || req.body.paymentscreenshot === '') {
      req.body.paymentscreenshot = null;
      if (payment.paymentscreenshot) {
        const oldPhotoPath = path.join(process.cwd(), 'public', payment.paymentscreenshot);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    } else if (req.body.paymentscreenshot && payment.paymentscreenshot && req.body.paymentscreenshot !== payment.paymentscreenshot) {
      const oldPhotoPath = path.join(process.cwd(), 'public', payment.paymentscreenshot);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    await payment.update(req.body);
    res.json({ status: 200, data: { message: 'Updated successfully', payment } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.paymentscreenshot) {
      const oldPhotoPath = path.join(process.cwd(), 'public', payment.paymentscreenshot);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    await payment.destroy();
    res.json({ status: 200, data: { message: 'Payment deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
