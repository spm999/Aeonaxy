// db.js
const postgres = require('postgres');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
PGUSER = decodeURIComponent(PGUSER);
PGDATABASE = decodeURIComponent(PGDATABASE);

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: 'require',
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPgVersion() {
  try {
    const result = await sql`select version()`;
    console.log('Connected to PostgreSQL database');
    console.log('PostgreSQL version:', result[0].version);
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
  }
}

getPgVersion();

