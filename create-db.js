import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQL_ROOT_PASSWORD,
    });

    const dbName = process.env.MYSQL_DATABASE;
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' created or already exists.`);

    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
  }
}

createDatabase();
