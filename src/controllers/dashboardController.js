import db from '../models/index.js';
import { Op } from 'sequelize';

const { Member, Trainer, Payment, Attendance } = db;

export const getStats = async (req, res) => {
  try {
    const { filter } = req.body; // e.g. "Last 6 Months" or "This Year"

    const now = new Date();
    let startDate;
    let endDate;
    let monthsData = [];

    const getMonthLabel = (date) => {
      return new Date(date).toLocaleString('default', { month: 'short' });
    };

    if (filter === 'This Year' || filter === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        monthsData.push({
          monthLabel: getMonthLabel(d),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          revenue: 0,
        });
      }
    } else {
      // Default: Last 6 Months
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsData.push({
          monthLabel: getMonthLabel(d),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          revenue: 0,
        });
      }
    }

    // 1. Top KPIs
    const totalMembers = await Member.count();
    const activeMembers = await Member.count({
      where: {
        status: {
          [Op.in]: ['active', 'Active']
        }
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const membersInside = await Attendance.count({ where: { date: today } }); // Todays attendance

    const allPayments = await Payment.findAll();
    const totalRevenue = allPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    // 2. Revenue Analytics (Month-wise Total Payment for the chart)
    const recentPayments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    recentPayments.forEach(p => {
      const d = new Date(p.paymentDate);
      const bucket = monthsData.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
      if (bucket) {
        bucket.revenue += parseFloat(p.amount);
      }
    });

    const revenueAnalytics = monthsData.map(m => ({
      month: m.monthLabel,
      revenue: m.revenue
    }));

    // 3. Peak Hours Data (based on today's check-ins)
    const todaysAttendances = await Attendance.findAll({
      where: { date: today }
    });

    // Initialize hours buckets for Peak Hours chart (e.g. 6AM, 9AM, 12PM, 3PM, 6PM, 9PM)
    const peakHoursData = [
      { time: '6 AM', count: 0 },
      { time: '9 AM', count: 0 },
      { time: '12 PM', count: 0 },
      { time: '3 PM', count: 0 },
      { time: '6 PM', count: 0 },
      { time: '9 PM', count: 0 },
    ];

    todaysAttendances.forEach(a => {
      if (a.checkInTime) {
        const hour = parseInt(a.checkInTime.split(':')[0], 10);
        if (hour >= 6 && hour < 9) peakHoursData[0].count += 1;
        else if (hour >= 9 && hour < 12) peakHoursData[1].count += 1;
        else if (hour >= 12 && hour < 15) peakHoursData[2].count += 1;
        else if (hour >= 15 && hour < 18) peakHoursData[3].count += 1;
        else if (hour >= 18 && hour < 21) peakHoursData[4].count += 1;
        else if (hour >= 21 || hour < 6) peakHoursData[5].count += 1;
      }
    });

    res.json({
      status: 200,
      data: {
        kpis: {
          totalMembers,
          activeMembers,
          membersInside,
          totalRevenue // Included as requested
        },
        revenueAnalytics,
        peakHours: peakHoursData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
