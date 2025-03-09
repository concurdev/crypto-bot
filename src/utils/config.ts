import mysql from "mysql2";
import dotenv from "dotenv";
import logger from "../utils/logger";

dotenv.config({ path: ".env" });

// MySQL Database Configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
});

connection.connect((err) => {
  if (err) {
    logger.error("Error connecting to the database:", err);
    process.exit(1);
  } else {
    logger.info("Connected to the database");
  }
});

// Export configuration and connection
export const config = {
  HOST: process.env.HOST,
  PORT: parseInt(process.env.PORT || "3000", 10),
  BROADCAST_PORT: parseInt(process.env.BROADCAST_PORT || "8383", 10),
  BASE_URL: process.env.BASE_URL,

  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
};

export { connection };
