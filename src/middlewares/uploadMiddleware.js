import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadProfilePhoto = upload.single('profilephoto');

export const processProfilePhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
    const uploadPath = path.join(__dirname, '../../public/uploads', filename);

    // Ensure directory exists
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Process image: resize, convert to WebP, compress
    await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .jpeg({ quality: 80 })
      .toFile(uploadPath);

    // Attach the new file path to req.body so it gets saved to the database
    req.body.profilephoto = `/uploads/${filename}`;

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ message: 'Error processing image upload', error: error.message });
  }
};
export const uploadPaymentScreenshot = upload.single('paymentscreenshot');

export const processPaymentScreenshot = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `payment-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
    const uploadPath = path.join(__dirname, '../../public/uploads', filename);

    // Ensure directory exists
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Process image: compress and convert to WebP
    await sharp(req.file.buffer)
      .resize(800, null, { // Resize width to 800px, auto height
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(uploadPath);

    req.body.paymentscreenshot = `/uploads/${filename}`;

    next();
  } catch (error) {
    console.error('Error processing payment screenshot:', error);
    res.status(500).json({ message: 'Error processing screenshot upload', error: error.message });
  }
};

export const uploadWorkoutImage = upload.single('workoutimage');

export const processWorkoutImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const filename = `workout-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;
    const uploadPath = path.join(__dirname, '../../public/uploads', filename);

    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await sharp(req.file.buffer)
      .resize(800, null, {
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(uploadPath);

    req.body.workoutimage = `/uploads/${filename}`;

    next();
  } catch (error) {
    console.error('Error processing workout image:', error);
    res.status(500).json({ message: 'Error processing image upload', error: error.message });
  }
};
