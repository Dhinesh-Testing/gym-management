import db from '../models/index.js';
const { Diet } = db;

const validateDietInput = (data) => {
  const { session, foodName, isQuantity, isGrams, quantity, grams } = data;

  if (!session || !['breakfast', 'lunch', 'eveningsnack', 'dinner'].includes(session)) {
    return "Valid session is required ('breakfast', 'lunch', 'eveningsnack', 'dinner')";
  }
  if (!foodName) {
    return "Food Name is required";
  }

  const hasQuantity = isQuantity === true || isQuantity === 'true';
  const hasGrams = isGrams === true || isGrams === 'true';

  if (!hasQuantity && !hasGrams) {
    return "At least one of Is Quantity or Is Grams must be enabled";
  }
  if (hasQuantity && (quantity === undefined || quantity === null || isNaN(quantity))) {
    return "Quantity is required when Is Quantity is enabled and must be a valid number";
  }
  if (hasGrams && (grams === undefined || grams === null || isNaN(grams))) {
    return "Grams is required when Is Grams is enabled and must be a valid number";
  }
  return null;
};

export const getAllDiets = async (req, res) => {
  try {
    const sessionFilter = req.body.session || req.query.session;
    
    const breakfastCount = await Diet.count({ where: { session: 'breakfast' } });
    const lunchCount = await Diet.count({ where: { session: 'lunch' } });
    const eveningsnackCount = await Diet.count({ where: { session: 'eveningsnack' } });
    const dinnerCount = await Diet.count({ where: { session: 'dinner' } });
    
    let whereClause = {};
    if (sessionFilter) {
      whereClause.session = sessionFilter;
    }
    
    const diets = await Diet.findAll({ where: whereClause });
    
    res.json({
      status: 200,
      data: {
        counts: {
          breakfast: breakfastCount,
          lunch: lunchCount,
          eveningsnack: eveningsnackCount,
          dinner: dinnerCount
        },
        records: diets
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createDiet = async (req, res) => {
  try {
    const validationError = validateDietInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const diet = await Diet.create(req.body);
    res.status(201).json({ status: 201, data: { message: 'Created successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateDiet = async (req, res) => {
  try {
    const validationError = validateDietInput(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const diet = await Diet.findByPk(req.params.id);
    if (!diet) return res.status(404).json({ message: 'Diet not found' });

    await diet.update(req.body);
    res.json({ status: 200, data: { message: 'Updated successfully', diet } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findByPk(req.params.id);
    if (!diet) return res.status(404).json({ message: 'Diet not found' });
    await diet.destroy();
    res.json({ status: 200, data: { message: 'Diet deleted successfully' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
