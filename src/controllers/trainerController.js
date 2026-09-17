import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { Trainer, Member, Workout, Diet } = db;

const cleanData = (data) => {
  const cleaned = { ...data };
  for (let key in cleaned) {
    if (cleaned[key] === '') {
      cleaned[key] = null;
    }
  }
  return cleaned;
};

export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ status: 200, data: trainers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerById = async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [Member, Workout, Diet]
    });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ status: 200, data: trainer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createTrainer = async (req, res) => {
  try {
    let trainerData = cleanData(req.body);
    delete trainerData.id; // Prevent explicit null from interfering with AUTO_INCREMENT
    
    if (trainerData.password) {
      const salt = await bcrypt.genSalt(10);
      trainerData.password = await bcrypt.hash(trainerData.password, salt);
    }
    const trainer = await Trainer.create(trainerData);
    res.status(201).json({ status: 201, data: { message: 'Created successfully', profilephoto: trainer.profilephoto } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    // If a new profile photo is uploaded or removed, delete the old one
    if (req.body.profilephoto === 'null' || req.body.profilephoto === null || req.body.profilephoto === '') {
      req.body.profilephoto = null;
      if (trainer.profilephoto) {
        const oldPhotoPath = path.join(process.cwd(), 'public', trainer.profilephoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    } else if (req.body.profilephoto && trainer.profilephoto && req.body.profilephoto !== trainer.profilephoto) {
      const oldPhotoPath = path.join(process.cwd(), 'public', trainer.profilephoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    let updateData = cleanData(req.body);
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    await trainer.update(updateData);
    res.json({ status: 200, data: { message: 'Updated successfully', profilephoto: trainer.profilephoto } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    // Delete the profile photo file if it exists
    if (trainer.profilephoto) {
      const photoPath = path.join(process.cwd(), 'public', trainer.profilephoto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await trainer.destroy();
    res.json({ status: 200, data: { message: 'Trainer deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const loginTrainer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const trainer = await Trainer.findOne({ where: { email } });
    if (!trainer) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, trainer.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: trainer.id, role: 'trainer' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '90d' });

    res.json({ status: 200, data: { token, user: { id: trainer.id, role: 'trainer', message: "Logged in successfully" } } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateTrainerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    await trainer.update({ status });
    res.json({ status: 200, data: { message: 'Trainer status updated successfully', status: trainer.status } });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerDashboardStats = async (req, res) => {
  try {
    const trainerId = req.params.id;
    const { WorkoutAssignment, Workout, Member } = db;

    const assignedMembersCount = await Member.count({ where: { assignedtrainer: trainerId } });

    // Use local time for 'today' based on the server
    const today = new Date();
    // adjust for timezone offset if necessary, or just use YYYY-MM-DD
    const todayString = today.toLocaleDateString('en-CA'); // Outputs YYYY-MM-DD

    const totalWorkoutsAssigned = await WorkoutAssignment.count({
      where: {
        trainerId: trainerId,
        scheduledDate: todayString
      }
    });

    const todayWorkoutsAssigned = await WorkoutAssignment.findAll({
      where: {
        trainerId: trainerId,
        scheduledDate: todayString
      },
      include: [
        { model: Member, attributes: ['id', 'fullname', 'profilephoto'] },
        { model: Workout }
      ]
    });

    res.json({
      status: 200,
      data: {
        assignedMembersCount,
        totalWorkoutsAssigned,
        todayWorkoutsAssigned
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerMembers = async (req, res) => {
  try {
    const members = await Member.findAll({
      where: { assignedtrainer: req.params.id },
      attributes: { exclude: ['password'] }
    });
    res.json({ status: 200, data: members });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

