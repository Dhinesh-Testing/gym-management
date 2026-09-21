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
    const { page = 1, limit = 30, month, date } = req.body;
    const offset = (page - 1) * limit;

    let whereClause = { trainerId };
    
    if (date) {
      whereClause.scheduledDate = date;
    } else {
      const { startDate, endDate } = getMonthDateRange(month);
      whereClause.scheduledDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const uniqueCombos = await DietAssignment.findAll({
      attributes: ['memberId', 'scheduledDate'],
      where: whereClause,
      group: ['memberId', 'scheduledDate'],
      order: [['scheduledDate', 'ASC']],
      raw: true
    });

    const totalRecords = uniqueCombos.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const paginatedCombos = uniqueCombos.slice(offset, offset + parseInt(limit));

    let paginatedData = [];

    if (paginatedCombos.length > 0) {
      const comboWhere = paginatedCombos.map(combo => ({
        memberId: combo.memberId,
        scheduledDate: combo.scheduledDate
      }));

      const rows = await DietAssignment.findAll({
        where: {
          trainerId,
          [Op.or]: comboWhere
        },
        include: [
          { model: Member, attributes: ['id', 'fullname', 'profilephoto'] },
          { model: Diet, attributes: ['id', 'session', 'foodName', 'isQuantity', 'isGrams', 'quantity', 'grams', 'description'] }
        ],
        order: [['scheduledDate', 'ASC']]
      });

      const groupedMap = new Map();
      rows.forEach(row => {
        const dateStr = row.scheduledDate instanceof Date 
            ? row.scheduledDate.toISOString().split('T')[0] 
            : row.scheduledDate;
        const key = `${row.memberId}_${dateStr}`;
        
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            memberId: row.memberId,
            scheduledDate: dateStr,
            status: row.status,
            notes: row.notes,
            Member: row.Member,
            diets: []
          });
        }
        
        if (row.Diet) {
          groupedMap.get(key).diets.push(row.Diet);
        }
      });

      paginatedData = paginatedCombos.map(combo => {
        const dateStr = combo.scheduledDate instanceof Date 
            ? combo.scheduledDate.toISOString().split('T')[0] 
            : combo.scheduledDate;
        return groupedMap.get(`${combo.memberId}_${dateStr}`);
      }).filter(Boolean);
    }

    res.json({
      status: 200,
      data: paginatedData,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        totalRecords,
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

    const assignment = await DietAssignment.findByPk(id);
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
