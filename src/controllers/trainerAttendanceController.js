import db from '../models/index.js';
const { TrainerAttendance, Trainer } = db;
import { Op } from 'sequelize';

export const getAllTrainerAttendance = async (req, res) => {
  try {
    const records = await TrainerAttendance.findAll({
      include: {
        model: Trainer,
        attributes: ["id", "fullname"]
      }
    });
    res.json({ status: 200, data: records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markTrainerAttendance = async (req, res) => {
  try {
    const { trainerId, date, checkInTime, checkOutTime } = req.body;

    const trainer = await Trainer.findByPk(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    let record = await TrainerAttendance.findOne({ where: { trainerId, date } });

    if (record) {
      if (checkOutTime) {
        await record.update({ checkOutTime });
        return res.json({ status: 200, data: { message: 'Updated successfully' } });
      }
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    record = await TrainerAttendance.create({ trainerId, date, checkInTime, checkOutTime });
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTrainerAttendance = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const month = req.query.month || req.body.month;
    const year = req.query.year || req.body.year;

    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ message: 'Invalid month or year provided' });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Calculate working days (excluding Sundays)
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    let totalWorkingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(targetYear, targetMonth - 1, i);
      if (date.getDay() !== 0) { // 0 is Sunday
        totalWorkingDays++;
      }
    }

    const records = await TrainerAttendance.findAll({
      where: {
        trainerId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const presentdays = records.length;
    let percentage = totalWorkingDays > 0 ? Math.round((presentdays / totalWorkingDays) * 100) : 0;
    if (percentage > 100) percentage = 100;

    res.json({
      status: 200,
      data: {
        presentdays,
        percentage,
        totalWorkingDays,
        records
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
