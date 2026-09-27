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

export const getAllTrainersAttendanceMonthWise = async (req, res) => {
  try {
    const month = req.body.month || new Date().getMonth() + 1;
    const year = req.body.year || new Date().getFullYear();

    const targetMonth = parseInt(month, 10);
    const targetYear = parseInt(year, 10);

    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({ message: 'Invalid month or year provided' });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Calculate Mon-Sat dates
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const attendanceDates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(targetYear, targetMonth - 1, i);
      if (date.getDay() !== 0) { // Not Sunday
        const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        attendanceDates.push(dateStr);
      }
    }

    // Get all active trainers
    const trainers = await Trainer.findAll({
      where: { status: 'active' },
      attributes: ['id', 'fullname']
    });

    // Get all attendance for the month
    const attendanceRecords = await TrainerAttendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Process data
    let totalCheckIns = 0;
    const presentTrainersSet = new Set();
    const absentTrainersSet = new Set();
    
    // Group attendance by trainerId and date
    const trainerAttendanceMap = {};
    attendanceRecords.forEach(record => {
      if (!trainerAttendanceMap[record.trainerId]) {
        trainerAttendanceMap[record.trainerId] = new Set();
      }
      
      let dateStr = record.date;
      if (typeof record.date === 'string' && record.date.length >= 10) {
          dateStr = record.date.substring(0, 10);
      } else {
          const d = new Date(record.date);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateStr = `${y}-${m}-${day}`;
      }
      trainerAttendanceMap[record.trainerId].add(dateStr);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let totalPastDates = 0;
    attendanceDates.forEach(d => { if (d <= todayStr) totalPastDates++; });

    const records = trainers.map(trainer => {
      const trainerAtt = trainerAttendanceMap[trainer.id] || new Set();
      const attendance = {};
      let hasAttended = false;
      let hasAbsent = false;

      attendanceDates.forEach(dateStr => {
        if (dateStr > todayStr) {
          attendance[dateStr] = null;
        } else {
          const isPresent = trainerAtt.has(dateStr);
          attendance[dateStr] = isPresent;
          if (isPresent) {
            hasAttended = true;
            totalCheckIns++;
          } else {
            hasAbsent = true;
          }
        }
      });

      if (hasAttended) presentTrainersSet.add(trainer.id);
      if (hasAbsent) absentTrainersSet.add(trainer.id);

      return {
        trainerId: trainer.id,
        trainerName: trainer.fullname,
        attendance
      };
    });

    const totalPossibleAttendance = trainers.length * totalPastDates;
    let attendanceRate = 0;
    if (totalPossibleAttendance > 0) {
      attendanceRate = parseFloat(((totalCheckIns / totalPossibleAttendance) * 100).toFixed(2));
    }

    res.json({
      status: 200,
      message: "Trainer Attendance fetched successfully",
      data: {
        month: targetMonth,
        year: targetYear,
        summary: {
          totalCheckIns,
          presentTrainers: presentTrainersSet.size,
          absentTrainers: absentTrainersSet.size,
          attendanceRate
        },
        attendanceDates,
        records
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
