import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { DB_USER, DB_HOST, DB_PASSWORD, DB_PORT, DB_NAME } = process.env;

if (!DB_NAME || !DB_USER) {
  console.error('FATAL ERROR: DB_NAME and DB_USER environment variables must be set.');
  process.exit(1);
}

const pgPoolConfig = {
  user: DB_USER,
  host: DB_HOST,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
};

/**
 * @file init-db.ts
 * @description A script to initialize the application database. It creates the database if it
 * doesn't exist and then applies the schema from `schema.sql`.
 */
const initDb = async () => {
  // First, connect to the default 'postgres' database to check for and create our app's DB.
  const pool = new Pool({ ...pgPoolConfig, database: 'postgres' });
  const client = await pool.connect();

  try {
    console.log("Checking for database '" + DB_NAME + "'...");
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);

    if (res.rowCount === 0) {
      console.log(`Database '${DB_NAME}' not found. Creating it...`);
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database '${DB_NAME}' created successfully.`);
    } else {
      console.log(`Database '${DB_NAME}' already exists.`);
      // If the DB exists, it might be owned by a different user.
      // To prevent permission errors, let's try to make the current user the owner.
      // NOTE: This command may fail if the user in your .env file is not a superuser.
      try {
        console.log(`Attempting to grant ownership of '${DB_NAME}' to user '${DB_USER}'...`);
        await client.query(`ALTER DATABASE "${DB_NAME}" OWNER TO "${DB_USER}"`);
        console.log(`Ownership successfully granted to '${DB_USER}'.`);
      } catch (ownershipError) {
        console.warn(`Could not grant ownership to user '${DB_USER}'. This might be okay, but if you see permission errors, you may need to run this command as a superuser: ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};`);
        console.warn(`Original error: ${(ownershipError as Error).message}`);
      }
    }
  } catch (error) {
    console.error('Error during database creation check:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  // Now, connect to our application's database to apply the schema.
  const appPool = new Pool({ ...pgPoolConfig, database: DB_NAME });
  const appClient = await appPool.connect();
  try {
    console.log(`Connecting to '${DB_NAME}' to apply schema...`);
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Dropping existing public schema to ensure a clean slate...');
    await appClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('Executing schema.sql...');
    await appClient.query(schemaSql);
    console.log('Schema applied successfully.');
  } catch (error) {
    console.error('Error applying schema:', error);
    throw error;
  } finally {
    appClient.release();
    await appPool.end();
  }
};

console.log('Starting database initialization...');
initDb()
  .then(() => {
    console.log('Database initialization completed successfully.');
  })
  .catch((e) => {
    console.error('Database initialization failed:', e);
    process.exit(1);
  }); 