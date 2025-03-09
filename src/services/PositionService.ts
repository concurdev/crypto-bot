import { connection } from "../utils/config";
import { Position } from "../models/Position";
import logger from "../utils/logger";

export class PositionService {
  static async getPositionForUser(userId: number): Promise<Position | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM positions WHERE user_id = ? LIMIT 1`;
      connection.query(query, [userId], (err, results) => {
        if (err) {
          logger.error("Error fetching position:", err);
          reject(err);
          return;
        }

        const rows = results as any[];

        if (!rows || rows.length === 0) {
          // No position found
          resolve(null);
          return;
        }

        const row = rows[0];
        if (!row || !row.user_id || !row.token || !row.amount || !row.entry_price) {
          logger.error("Invalid data in position row:", row);
          reject(new Error("Invalid position data"));
          return;
        }

        resolve(new Position(row.user_id, row.token, row.amount, row.entry_price));
      });
    });
  }

  static async getPriceForUser(userId: number): Promise<number> {
    const position = await this.getPositionForUser(userId);

    if (position === null) {
      throw new Error("Position not found");
    }

    // Mock value
    return 5000;
  }

  static async closePosition(position: Position): Promise<void> {
    // Close the position logic
    logger.info(`Closing position for user ${position.userId} on token ${position.token}`);
  }
}
