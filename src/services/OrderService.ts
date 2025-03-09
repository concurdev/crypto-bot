import { connection } from "../utils/config";
import { Order } from "../models/Order";
import { PositionService } from "./PositionService";
import * as mysql2 from "mysql2";
import logger from "../utils/logger";
import { RowDataPacket } from "mysql2";
import WebSocket from "ws";

export class OrderService {
  static websocketServer: WebSocket.Server;

  // Method to initialize WebSocket server (this would be done during app startup)
  static initializeWebSocketServer(server: WebSocket.Server) {
    this.websocketServer = server;
  }

  // Method to broadcast a message to all connected WebSocket clients
  static broadcast(message: string) {
    this.websocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  static async createOrder(order: Order): Promise<Order> {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO orders (user_id, type, trigger_price, status) VALUES (?, ?, ?, ?)`;
      connection.query(query, [order.userId, order.type, order.triggerPrice, order.status], (err, results) => {
        if (err) {
          logger.error("Error creating order:", err);
          reject(err);
        }

        const result = results as mysql2.ResultSetHeader;

        if (result && result.insertId) {
          order.id = result.insertId;

          // Broadcasting the order creation to WebSocket clients
          this.broadcast(`New order created with ID: ${order.id} for User ID: ${order.userId}`);

          resolve(order);
        } else {
          reject(new Error("Failed to retrieve insertId"));
        }
      });
    });
  }

  static async getOrdersByUserId(userId: number): Promise<Order[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM orders WHERE user_id = ?`;
      connection.query(query, [userId], (err, results) => {
        if (err) {
          logger.error("Error fetching orders:", err);
          reject(err);
        }

        const rows = results as RowDataPacket[];
        const orders = rows.map((row) => new Order(row.id, row.user_id, row.type, row.trigger_price));
        resolve(orders);
      });
    });
  }

  static async executeStopLoss(orderId: number, userId: number): Promise<void> {
    try {
      const order = await this.getOrderById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status === "active") {
        logger.info(`Executing stop loss for order ID: ${order.id}`);
        order.status = "executed";
        const position = await PositionService.getPositionForUser(userId);
        if (position) {
          await PositionService.closePosition(position);
          logger.info(`Executed stop-loss order with ID: ${order.id} and closed position.`);

          // Broadcasting stop-loss execution to WebSocket clients
          this.broadcast(`Stop-loss executed for Order ID: ${order.id}`);
        } else {
          throw new Error("Position not found for user");
        }
      } else {
        logger.info(`Order ID: ${order.id} is not active, skipping execution.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error executing stop-loss for order ID: ${orderId}: ${error.message}`);
      } else {
        logger.error(`An unknown error occurred during stop-loss execution for order ID: ${orderId}`);
      }
      throw error;
    }
  }

  static async getOrderById(orderId: number): Promise<Order | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM orders WHERE id = ?`;
      connection.query(query, [orderId], (err, results) => {
        if (err) {
          logger.error("Error fetching order by ID:", err);
          reject(err);
        }

        const rows = results as RowDataPacket[];
        if (rows.length === 0) {
          logger.warn(`Order with ID: ${orderId} not found`);
          resolve(null);
        } else {
          const row = rows[0];
          resolve(new Order(row.id, row.user_id, row.type, row.trigger_price));
        }
      });
    });
  }

  static async executeTakeProfit(orderId: number, userId: number): Promise<void> {
    try {
      const order = await this.getOrderById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status === "active") {
        logger.info(`Executing take profit for order ID: ${order.id}`);
        order.status = "executed";
        const position = await PositionService.getPositionForUser(userId);
        if (position) {
          // Your logic to handle take profit here
          logger.info(`Executed take-profit order with ID: ${order.id} for position`);

          // Broadcasting take-profit execution to WebSocket clients
          this.broadcast(`Take-profit executed for Order ID: ${order.id}`);
        } else {
          throw new Error("Position not found for user");
        }
      } else {
        logger.info(`Order ID: ${order.id} is not active, skipping execution.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error executing take-profit for order ID: ${orderId}: ${error.message}`);
      } else {
        logger.error(`An unknown error occurred during take-profit execution for order ID: ${orderId}`);
      }
      throw error;
    }
  }
}
