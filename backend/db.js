import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fragrance_chatbot",
  password: "2003Rahul",
  port: 5432,
});

export default pool;