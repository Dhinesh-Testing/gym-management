import db from '../models/index.js';
const { FoodCategory } = db;

export const getAllFoodCategories = async (req, res) => {
  try {
    const categories = await FoodCategory.findAll();
    res.json({
      status: 200,
      data: {
        records: categories
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createFoodCategory = async (req, res) => {
  try {
    const { categoryname } = req.body;
    if (!categoryname) {
      return res.status(400).json({ message: 'Category Name is required' });
    }

    const category = await FoodCategory.create({ categoryname });
    res.status(201).json({ status: 201, data: { message: 'Created successfully', category } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFoodCategory = async (req, res) => {
  try {
    const { categoryname } = req.body;
    if (!categoryname) {
      return res.status(400).json({ message: 'Category Name is required' });
    }

    const category = await FoodCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Food Category not found' });

    await category.update({ categoryname });
    res.json({ status: 200, data: { message: 'Updated successfully', category } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteFoodCategory = async (req, res) => {
  try {
    const category = await FoodCategory.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Food Category not found' });
    
    await category.destroy();
    res.json({ status: 200, data: { message: 'Food Category deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
