import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @file database.ts
 * @description This file manages the connection to the PostgreSQL database.
 */

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export default pool; 