import db from '../models/index.js';
import { Op } from 'sequelize';

const { DietAssignment, Member, Trainer, Diet } = db;

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

export const assignDiets = async (req, res) => {
  try {
    const { memberid, trainerId, diets } = req.body;

    if (!diets || !Array.isArray(diets)) {
      return res.status(400).json({ message: "Diets array is required" });
    }

    // Verify all provided diets exist
    const requestedDietIds = diets.map(d => d.dietId);
    const existingDiets = await Diet.findAll({
      where: { id: requestedDietIds },
      attributes: ['id']
    });

    if (existingDiets.length !== new Set(requestedDietIds).size) {
      return res.status(400).json({ message: "One or more provided dietIds do not exist in the database." });
    }

    const assignments = diets.map(d => ({
      memberId: memberid,
      trainerId,
      dietId: d.dietId,
      scheduledDate: d.scheduledDate,
      status: d.status || 'pending',
      notes: d.notes || null,
    }));

    await DietAssignment.bulkCreate(assignments);

    res.status(201).json({ status: 201, data: { message: 'Diets assigned successfully' } });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Invalid memberId or trainerId provided. The user does not exist.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerDiets = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { page = 1, limit = 30, month } = req.body;
    const offset = (page - 1) * limit;

    const { startDate, endDate } = getMonthDateRange(month);

    const { count, rows } = await DietAssignment.findAndCountAll({
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
        { model: Diet, attributes: ['id', 'session', 'foodName', 'isQuantity', 'isGrams', 'quantity', 'grams', 'description'] }
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

export const getMemberDiets = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { date } = req.body;

    const targetDate = date || new Date().toLocaleDateString('en-CA');

    const rows = await DietAssignment.findAll({
      where: {
        memberId,
        scheduledDate: targetDate
      },
      include: [
        { model: Trainer, attributes: ['id', 'fullname'] },
        { model: Diet, attributes: ['id', 'session', 'foodName', 'isQuantity', 'isGrams', 'quantity', 'grams', 'description'] }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    res.json({
      status: 200,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rescheduleDiet = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({ message: "newDate is required" });
    }

    const assignment = await DietAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.scheduledDate = newDate;
    await assignment.save();

    res.json({ status: 200, data: { message: 'Diet rescheduled successfully' } });
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

    const assignment = await DietAssignment.findByPk(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.status = status;
    await assignment.save();

    res.json({ status: 200, data: { message: 'Diet status updated successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, status, notes } = req.body;

    const assignment = await DietAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (scheduledDate) assignment.scheduledDate = scheduledDate;
    if (status) {
      if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Allowed values: pending, completed" });
      }
      assignment.status = status;
    }
    if (notes !== undefined) assignment.notes = notes;

    await assignment.save();
    res.json({ status: 200, data: { message: 'Assignment updated successfully', assignment } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeAssignedDiet = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await DietAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.destroy();
    res.json({ status: 200, data: { message: 'Assigned diet removed successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
