import { connection } from "../utils/config";
import { User } from "../models/User";
import * as mysql2 from "mysql2";
import logger from "../utils/logger";

export class UserService {
  static async createUser(name: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (name) VALUES (?)`;
      connection.query(query, [name], (err, results) => {
        if (err) {
          logger.error("Error creating user:", err);
          reject(err);
          return;
        }

        const result = results as mysql2.ResultSetHeader;

        if (result && result.insertId) {
          const user = new User(result.insertId, name);
          resolve(user);
        } else {
          reject(new Error("Failed to retrieve insertId"));
        }
      });
    });
  }

  // New method to get all users
  static async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users`;
      connection.query(query, (err, results) => {
        if (err) {
          logger.error("Error fetching users:", err);
          reject(err);
        }

        const rows = results as mysql2.RowDataPacket[];
        const users = rows.map((row) => new User(row.id, row.name));
        resolve(users);
      });
    });
  }
}
