import pg from "pg";

const { Pool } = pg;

const pgConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  }
};

const connection = new Pool(pgConfig);

export default connection;
