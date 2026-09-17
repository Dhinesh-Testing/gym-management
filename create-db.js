import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    const dbName = process.env.DB_NAME || 'gym_management';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' created or already exists.`);

    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

createDatabase();
