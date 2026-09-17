import db from '../models/index.js';
import { Op } from 'sequelize';

const { Member, Payment } = db;

export const getReports = async (req, res) => {
  try {
    const { filter } = req.body; // "6months", "this-year", "last-year"

    const now = new Date();
    let startDate;
    let endDate;
    let monthsData = [];

    const getMonthLabel = (date) => {
      return new Date(date).toLocaleString('default', { month: 'short' });
    };

    if (filter === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        monthsData.push({
          monthLabel: getMonthLabel(d),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          revenueMembership: 0,
          revenuePT: 0,
          newMembers: 0,
        });
      }
    } else if (filter === 'last-year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear() - 1, i, 1);
        monthsData.push({
          monthLabel: getMonthLabel(d),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          revenueMembership: 0,
          revenuePT: 0,
          newMembers: 0,
        });
      }
    } else {
      // Default: "6months"
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsData.push({
          monthLabel: getMonthLabel(d),
          monthIndex: d.getMonth(),
          year: d.getFullYear(),
          revenueMembership: 0,
          revenuePT: 0,
          newMembers: 0,
        });
      }
    }

    // 1. KPIs
    // Total Revenue
    const recentPayments = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    const totalRevenue = recentPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    // New Members
    const recentMembers = await Member.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    const newMembersCount = recentMembers.length;

    // Avg Retention Rate
    const totalMembersCount = await Member.count();
    const activeMembersCount = await Member.count({
      where: {
        status: {
          [Op.in]: ['active', 'Active']
        }
      }
    });
    const retentionRate = totalMembersCount > 0 ? Math.round((activeMembersCount / totalMembersCount) * 100) : 100;

    // 2. Populate Charts Data
    recentPayments.forEach(p => {
      const d = new Date(p.paymentDate);
      const bucket = monthsData.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
      if (bucket) {
        const remarks = p.remarks ? p.remarks.toLowerCase() : '';
        if (remarks.includes('pt') || remarks.includes('personal training') || remarks.includes('trainer')) {
          bucket.revenuePT += parseFloat(p.amount);
        } else {
          bucket.revenueMembership += parseFloat(p.amount);
        }
      }
    });

    recentMembers.forEach(m => {
      const d = new Date(m.createdAt);
      const bucket = monthsData.find(b => b.monthIndex === d.getMonth() && b.year === d.getFullYear());
      if (bucket) {
        bucket.newMembers += 1;
      }
    });

    let cumulativeMembers = await Member.count({
      where: {
        createdAt: {
          [Op.lt]: startDate
        }
      }
    });

    const revenueBreakdown = monthsData.map(m => ({
      month: m.monthLabel,
      membership: m.revenueMembership,
      pt: m.revenuePT
    }));

    const memberGrowth = monthsData.map(m => {
      cumulativeMembers += m.newMembers;
      return {
        month: m.monthLabel,
        members: cumulativeMembers
      };
    });

    res.json({
      status: 200,
      data: {
        kpis: {
          totalRevenue,
          newMembers: newMembersCount,
          retentionRate
        },
        charts: {
          revenueBreakdown,
          memberGrowthTrend: memberGrowth
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
