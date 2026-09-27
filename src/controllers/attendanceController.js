import db from '../models/index.js';
const { Attendance, Member } = db;

import { Op } from 'sequelize';

export const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.findAll({
      include: {
        model: Member,
        attributes: ["id", "fullname"]
      }
    });
    res.json({ status: 200, data: records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { memberId, date, checkInTime, checkOutTime } = req.body;

    const member = await Member.findByPk(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    let record = await Attendance.findOne({ where: { memberId, date } });

    if (record) {
      if (checkOutTime) {
        await record.update({ checkOutTime });
        return res.json({ status: 200, data: { message: 'Updated successfully' } });
      }
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    record = await Attendance.create({ memberId, date, checkInTime, checkOutTime });
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const getMemberAttendance = async (req, res) => {
  try {
    const { memberId } = req.params;
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

    const records = await Attendance.findAll({
      where: {
        memberId,
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

export const getAllMembersAttendanceMonthWise = async (req, res) => {
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

    // Get all active members
    const members = await Member.findAll({
      where: { status: 'active' },
      attributes: ['id', 'fullname']
    });

    // Get all attendance for the month
    const attendanceRecords = await Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Process data
    let totalCheckIns = 0;
    const presentMembersSet = new Set();
    const absentMembersSet = new Set();
    
    // Group attendance by memberId and date
    const memberAttendanceMap = {};
    attendanceRecords.forEach(record => {
      if (!memberAttendanceMap[record.memberId]) {
        memberAttendanceMap[record.memberId] = new Set();
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
      memberAttendanceMap[record.memberId].add(dateStr);
    });

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let totalPastDates = 0;
    attendanceDates.forEach(d => { if (d <= todayStr) totalPastDates++; });

    const records = members.map(member => {
      const memberAtt = memberAttendanceMap[member.id] || new Set();
      const attendance = {};
      let hasAttended = false;
      let hasAbsent = false;

      attendanceDates.forEach(dateStr => {
        if (dateStr > todayStr) {
          attendance[dateStr] = null;
        } else {
          const isPresent = memberAtt.has(dateStr);
          attendance[dateStr] = isPresent;
          if (isPresent) {
            hasAttended = true;
            totalCheckIns++;
          } else {
            hasAbsent = true;
          }
        }
      });

      if (hasAttended) presentMembersSet.add(member.id);
      if (hasAbsent) absentMembersSet.add(member.id);

      return {
        memberId: member.id,
        memberName: member.fullname,
        attendance
      };
    });

    const totalPossibleAttendance = members.length * totalPastDates;
    let attendanceRate = 0;
    if (totalPossibleAttendance > 0) {
      attendanceRate = parseFloat(((totalCheckIns / totalPossibleAttendance) * 100).toFixed(2));
    }

    res.json({
      status: 200,
      message: "Attendance fetched successfully",
      data: {
        month: targetMonth,
        year: targetYear,
        summary: {
          totalCheckIns,
          presentMembers: presentMembersSet.size,
          absentMembers: absentMembersSet.size,
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
