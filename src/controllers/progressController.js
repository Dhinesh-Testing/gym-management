import db from '../models/index.js';
import { Op } from 'sequelize';

const { ProgressLog, Member } = db;

export const addProgressLog = async (req, res) => {
  try {
    const { memberId, date, weight, bodyFat, bmi, muscleMass, chest, waist, arms, thighs, targetWeight } = req.body;

    // Validate member exists
    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const log = await ProgressLog.create({
      memberId,
      date,
      weight,
      bodyFat,
      bmi,
      muscleMass,
      chest,
      waist,
      arms,
      thighs,
      targetWeight
    });

    res.status(201).json({ status: 201, data: { message: 'Progress log added successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProgressOverview = async (req, res) => {
  try {
    const { memberId } = req.params;

    const currentLog = await ProgressLog.findOne({
      where: { memberId },
      order: [['date', 'DESC']]
    });

    if (!currentLog) {
      return res.status(200).json({ status: 200, data: null });
    }

    const previousLog = await ProgressLog.findOne({
      where: {
        memberId,
        date: { [Op.lt]: currentLog.date }
      },
      order: [['date', 'DESC']]
    });

    const calculateTrend = (current, previous) => {
      if (current === null || current === undefined || previous === null || previous === undefined) return 0;
      return Number((current - previous).toFixed(2));
    };

    const overview = {
      current: currentLog,
      trends: {
        weight: calculateTrend(currentLog.weight, previousLog?.weight),
        bodyFat: calculateTrend(currentLog.bodyFat, previousLog?.bodyFat),
        bmi: calculateTrend(currentLog.bmi, previousLog?.bmi),
        muscleMass: calculateTrend(currentLog.muscleMass, previousLog?.muscleMass),
        chest: calculateTrend(currentLog.chest, previousLog?.chest),
        waist: calculateTrend(currentLog.waist, previousLog?.waist),
        arms: calculateTrend(currentLog.arms, previousLog?.arms),
        thighs: calculateTrend(currentLog.thighs, previousLog?.thighs),
      },
      targetWeight: currentLog.targetWeight
    };

    res.status(200).json({ status: 200, data: overview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProgressHistory = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { filter } = req.query;

    let whereClause = { memberId };

    if (filter === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      whereClause.date = {
        [Op.gte]: sixMonthsAgo
      };
    }

    const history = await ProgressLog.findAll({
      where: whereClause,
      order: [['date', 'ASC']]
    });

    res.status(200).json({ status: 200, data: history });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
