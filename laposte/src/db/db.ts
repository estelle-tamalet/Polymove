import pkg from "pg";

const { Pool } = pkg;

async function ensureDatabaseExists(): Promise<void> {
  const adminPool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres",
  });

  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || "polymove_laposte"]
    );

    if (result.rows.length === 0) {
      console.log(`Creating database ${process.env.DB_NAME || "polymove_laposte"}...`);
      await adminPool.query(
        `CREATE DATABASE ${process.env.DB_NAME || "polymove_laposte"}`
      );
      console.log(`✓ Database ${process.env.DB_NAME || "polymove_laposte"} created`);
    }
  } catch (err) {
    console.error("Error ensuring database exists:", err);
    throw err;
  } finally {
    await adminPool.end();
  }
}

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "polymove_laposte",
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
});

export const initDatabase = async (): Promise<void> => {
  try {
    await ensureDatabaseExists();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        domain VARCHAR(255) NOT NULL,
        channel VARCHAR(50) NOT NULL,
        contact VARCHAR(255) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, channel)
      );
    `);

    console.log("✓ Database initialized - subscribers table ready");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
};
