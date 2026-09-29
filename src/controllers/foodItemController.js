import db from '../models/index.js';
const { FoodItem, FoodCategory } = db;

export const getAllFoodItems = async (req, res) => {
  try {
    const categoryid = req.body.categoryid || req.query.categoryid;

    let whereClause = {};
    if (categoryid) {
      whereClause.categoryid = categoryid;
    }

    // Attempting to fetch with associated Category (if it exists)
    const items = await FoodItem.findAll({
      where: whereClause,
      include: [{ model: FoodCategory }]
    });

    res.json({
      status: 200,
      data: {
        records: items
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createFoodItem = async (req, res) => {
  try {
    const { foodname, categoryid } = req.body;
    if (!foodname || !categoryid) {
      return res.status(400).json({ message: 'Food Name and Category ID are required' });
    }

    const item = await FoodItem.create({ foodname, categoryid });
    res.status(201).json({ status: 201, data: { message: 'Created successfully', item } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFoodItem = async (req, res) => {
  try {
    const { foodname, categoryid } = req.body;
    if (!foodname || !categoryid) {
      return res.status(400).json({ message: 'Food Name and Category ID are required' });
    }

    const item = await FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food Item not found' });

    await item.update({ foodname, categoryid });
    res.json({ status: 200, data: { message: 'Updated successfully', item } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFoodItem = async (req, res) => {
  try {
    const item = await FoodItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Food Item not found' });

    await item.destroy();
    res.json({ status: 200, data: { message: 'Food Item deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
