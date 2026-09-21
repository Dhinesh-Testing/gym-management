import db from '../models/index.js';
import { Op } from 'sequelize';

const { WorkoutAssignment, Member, Trainer, Workout } = db;

const getMonthDateRange = (monthStr) => {
  let targetYear, targetMonth;
  if (monthStr) {
    const parts = monthStr.split('-');
    targetYear = parseInt(parts[0], 10);
    targetMonth = parseInt(parts[1], 10);
  } else {
    const now = new Date();
    targetYear = now.getFullYear();
    targetMonth = now.getMonth() + 1;
  }
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
  return { startDate, endDate };
};

export const assignWorkouts = async (req, res) => {
  try {
    const { memberId, trainerId, workouts } = req.body;

    if (!workouts || !Array.isArray(workouts)) {
      return res.status(400).json({ message: "Workouts array is required" });
    }

    const assignments = workouts.map(w => ({
      memberId,
      trainerId,
      workoutId: w.workoutId,
      scheduledDate: w.scheduledDate,
      status: w.status || 'pending',
      notes: w.notes || null,
    }));

    await WorkoutAssignment.bulkCreate(assignments);

    res.status(201).json({ status: 201, data: { message: 'Workouts assigned successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerAssignments = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, limit = 30, month } = req.body;
    const offset = (page - 1) * limit;

    let startDate, endDate;
    if (month) {
      const range = getMonthDateRange(month);
      startDate = range.startDate;
      endDate = range.endDate;
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    const { count, rows } = await WorkoutAssignment.findAndCountAll({
      where: {
        trainerId,
        scheduledDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Member, attributes: ['id', 'fullname', 'profilephoto'] },
        { model: Workout, attributes: ['id', 'title', 'targetmuscle', 'difficultlevel'] }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: 200,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalRecords: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMemberAssignments = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { date } = req.body;

    const targetDate = date || new Date().toLocaleDateString('en-CA');

    const rows = await WorkoutAssignment.findAll({
      where: {
        memberId,
        scheduledDate: targetDate
      },
      include: [
        { model: Trainer, attributes: ['id', 'fullname'] },
        { model: Workout, attributes: ['id', 'title', 'targetmuscle', 'difficultlevel', 'duration', 'description'] }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    let completedCount = 0;
    let pendingCount = 0;
    let totalDuration = 0;

    rows.forEach(assignment => {
      if (assignment.status === 'completed') completedCount++;
      if (assignment.status === 'pending') pendingCount++;
      if (assignment.Workout && assignment.Workout.duration) {
        const dur = parseInt(assignment.Workout.duration);
        if (!isNaN(dur)) {
          totalDuration += dur;
        }
      }
    });

    res.json({
      status: 200,
      data: rows,
      completed: completedCount,
      pending: pendingCount,
      totalDuration: totalDuration
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rescheduleAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({ message: "newDate is required" });
    }

    const assignment = await WorkoutAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.scheduledDate = newDate;
    await assignment.save();

    res.json({ status: 200, data: { message: 'Workout rescheduled successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed values: pending, completed" });
    }

    const assignment = await WorkoutAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.status = status;
    await assignment.save();

    res.json({ status: 200, data: { message: 'Workout status updated successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await WorkoutAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.body.status && !['pending', 'completed'].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status. Allowed values: pending, completed" });
    }

    await assignment.update(req.body);
    res.json({ status: 200, data: { message: 'Assignment updated successfully', assignment } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await WorkoutAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.destroy();
    res.json({ status: 200, data: { message: 'Assignment deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
