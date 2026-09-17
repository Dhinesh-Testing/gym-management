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
    const subscription = await MemberSubscription.create(req.body);
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
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
