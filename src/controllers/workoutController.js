import db from '../models/index.js';
const { Workout } = db;

export const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.findAll();
    res.json({ status: 200, data: workouts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create(req.body);
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    await workout.update(req.body);
    res.json({ status: 200, data: { message: 'Updated successfully', workout } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    await workout.destroy();
    res.json({ status: 200, data: { message: 'Workout deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

import { Op } from 'sequelize';

export const searchWorkout = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const workouts = await Workout.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      }
    });
    res.json({ status: 200, data: workouts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
