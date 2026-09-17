import db from '../models/index.js';
const {  MembershipPlan, MemberSubscription, Member  } = db;

export const getAllPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.findAll();
    res.json({ status: 200, data: plans });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await MemberSubscription.findAll({ include: [Member, MembershipPlan] });
    res.json({ status: 200, data: subscriptions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const assignSubscription = async (req, res) => {
  try {
    const { memberId, planId, startDate: reqStartDate } = req.body;

    if (!memberId || !planId) {
      return res.status(400).json({ message: 'memberId and planId are required' });
    }

    const plan = await MembershipPlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Membership Plan not found' });
    }

    const startDate = reqStartDate ? new Date(reqStartDate) : new Date();
    const endDate = new Date(startDate);

    if (plan.durationtype === 'Days') {
      endDate.setDate(endDate.getDate() + plan.duration);
    } else if (plan.durationtype === 'Months') {
      endDate.setMonth(endDate.getMonth() + plan.duration);
    } else if (plan.durationtype === 'Years') {
      endDate.setFullYear(endDate.getFullYear() + plan.duration);
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const subscription = await MemberSubscription.create({
      memberId,
      planId,
      startDate: startStr,
      endDate: endStr,
      status: req.body.status || 'active',
    });

    res.status(201).json({ status: 201, data: { message: 'Created successfully', subscription } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByPk(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    
    await plan.update(req.body);
    res.json({ status: 200, data: { message: 'Updated successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByPk(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    
    await plan.destroy();
    res.json({ status: 200, data: { message: 'Deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMemberSubscriptionDetails = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Find the active subscription for the member
    const subscription = await MemberSubscription.findOne({
      where: { memberId, status: 'active' },
      include: [
        {
          model: MembershipPlan,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found for this member' });
    }

    // Attempt to find a related payment to determine payment status
    const payment = await db.Payment.findOne({
      where: { memberId },
      order: [['paymentDate', 'DESC']],
    });

    const paymentStatus = payment ? 'Paid' : 'Pending';

    const result = {
      subscriptionId: subscription.id,
      planName: subscription.MembershipPlan?.name,
      startDate: subscription.startDate,
      expiryDate: subscription.endDate,
      price: subscription.MembershipPlan?.offerprice || subscription.MembershipPlan?.price,
      paymentStatus,
      membershipStatus: subscription.status,
      planDetails: subscription.MembershipPlan,
    };

    res.json({ status: 200, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
