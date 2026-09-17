import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import db from './src/models/index.js';
const { sequelize } = db;

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    // await sequelize.sync({ force: false }); // Set force: true to recreate tables on start
    console.log('Models synchronized.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
