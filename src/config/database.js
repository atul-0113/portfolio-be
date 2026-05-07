require('dotenv').config();

const { Client } = require('pg');
const { prisma } = require('./prisma');

const quoteIdentifier = (value) => `"${value.replace(/"/g, '""')}"`;

const ensureDatabaseExists = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace(/^\//, '');

  if (!databaseName) {
    throw new Error('DATABASE_URL must include a database name');
  }

  const maintenanceUrl = new URL(databaseUrl);
  maintenanceUrl.pathname = '/postgres';

  const client = new Client({
    connectionString: maintenanceUrl.toString()
  });

  await client.connect();

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      console.log(`Database created: ${databaseName}`);
    }
  } finally {
    await client.end();
  }
};

const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for Prisma');
    }

    await ensureDatabaseExists();
    await prisma.$connect();
    console.log('Prisma connected to database');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
