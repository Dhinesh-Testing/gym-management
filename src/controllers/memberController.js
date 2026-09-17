import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
const { Member, Trainer, MemberSubscription, MembershipPlan } = db;

const cleanData = (data) => {
  const cleaned = { ...data };
  for (let key in cleaned) {
    if (cleaned[key] === '') {
      cleaned[key] = null;
    }
  }
  return cleaned;
};

export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json({ status: 200, data: members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        Trainer,
        MembershipPlan,
        { model: MemberSubscription, include: [MembershipPlan] }
      ]
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ status: 200, data: member });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    let memberData = cleanData(req.body);
    if (memberData.password) {
      const salt = await bcrypt.genSalt(10);
      memberData.password = await bcrypt.hash(memberData.password, salt);
    }
    const member = await Member.create(memberData);
    res.status(201).json({ status: 201, data: { message: 'Created successfully', profilephoto: member.profilephoto } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    if (req.body.profilephoto === 'null' || req.body.profilephoto === null || req.body.profilephoto === '') {
      req.body.profilephoto = null;
      if (member.profilephoto) {
        const oldPhotoPath = path.join(process.cwd(), 'public', member.profilephoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    } else if (req.body.profilephoto && member.profilephoto && req.body.profilephoto !== member.profilephoto) {
      const oldPhotoPath = path.join(process.cwd(), 'public', member.profilephoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    let updateData = cleanData(req.body);
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    await member.update(updateData);
    res.json({ status: 200, data: { message: 'Updated successfully', profilephoto: member.profilephoto } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    // Delete the profile photo file if it exists
    if (member.profilephoto) {
      const photoPath = path.join(process.cwd(), 'public', member.profilephoto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await member.destroy();
    res.json({ status: 200, data: { message: 'Member deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const member = await Member.findOne({ where: { email } });
    if (!member) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: member.id, role: 'member' };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', { expiresIn: '1d' });

    res.json({ status: 200, data: { token, user: { id: member.id, role: 'member', message: "Logged in successfully" } } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.update({ status });
    res.json({ status: 200, data: { message: 'Member status updated successfully', status: member.status } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const searchMember = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const members = await Member.findAll({
      where: {
        fullname: {
          [Op.like]: `%${query}%`
        }
      },
      attributes: ['id', 'fullname', 'profilephoto', 'status']
    });
    res.json({ status: 200, data: members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
