import fs from 'fs';
import path from 'path';
import db from '../db.js';

const init = async () => {
  try {
    const schema = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), '../models/schema.sql'), 'utf8');
    await db.query(schema);
    console.log('Database tables created successfully.');
  } catch (error) {
    console.error('Error creating database tables:', error);
  } finally {
    // In a real application, you might not want to end the pool here
    // if the script is part of a larger application startup process.
    // For a standalone script, it's fine.
    // const { pool } = require('../db');
    // pool.end();
  }
};

init();
