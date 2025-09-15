import pg from 'pg';

const { Pool } = pg;

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} else {
  throw new Error('No database connection string was provided. Please set DATABASE_URL environment variable.');
}

// Template literal function to mimic neon's sql`` syntax
const sql = async (strings, ...values) => {
  const client = await pool.connect();
  try {
    // Build the query string
    let query = '';
    for (let i = 0; i < strings.length; i++) {
      query += strings[i];
      if (i < values.length) {
        query += `$${i + 1}`;
      }
    }
    
    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
};

export default sql;