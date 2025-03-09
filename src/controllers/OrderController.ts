import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { PositionService } from "../services/PositionService";
import { PriceSimulationService } from "../services/PriceSimulationService";
import { Order } from "../models/Order";
import logger from "../utils/logger";

export class OrderController {
  static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, triggerPrice } = req.body;

      // Validate required fields
      if (!userId || !type || !triggerPrice) {
        logger.warn("Missing required fields in order creation");
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Validate the type (stop-loss, take-profit)
      if (type !== "stop-loss" && type !== "take-profit") {
        logger.warn("Invalid order type received");
        res.status(400).json({ error: "Invalid order type" });
        return;
      }

      // Create the order
      const order = new Order(0, userId, type, triggerPrice);
      const createdOrder = await OrderService.createOrder(order);

      logger.info(`Order created successfully with ID: ${createdOrder.id}`);
      // Send the response
      res.status(201).json({
        message: `Order created successfully with ID: ${createdOrder.id}`,
        order: createdOrder,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error creating order: ${error.message}`);
        res.status(500).json({ error: "Failed to create order" });
      } else {
        logger.error("Unknown error occurred while creating order");
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  }

  static async getOrdersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      logger.info(`Fetching orders for userId ${userId}`);
      const orders = await OrderService.getOrdersByUserId(Number(userId));

      res.status(200).json(orders);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error fetching orders for userId ${req.params.userId}: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch orders" });
      } else {
        logger.error("Unknown error occurred while fetching orders");
        res.status(500).json({ error: "Failed to fetch orders" });
      }
    }
  }

  static async checkOrder(req: Request, res: Response): Promise<void> {
    try {
      const { userId, triggerPrice } = req.body;
      const price = await PositionService.getPriceForUser(userId);

      if (price >= triggerPrice) {
        logger.info(`Trigger price met for user ${userId}`);
        res.status(200).json({ message: "Trigger price met, execute stop loss" });
      } else {
        logger.info(`Price below trigger for user ${userId}, waiting...`);
        res.status(200).json({ message: "Price below trigger, waiting..." });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error checking order for userId ${req.body.userId}: ${error.message}`);
        res.status(500).json({ error: "Failed to check order" });
      } else {
        logger.error("Unknown error occurred while checking order");
        res.status(500).json({ error: "Failed to check order" });
      }
    }
  }

  static async executeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, userId } = req.body;
      const order = await OrderService.getOrderById(orderId);

      if (order === null) {
        logger.warn(`Order with ID: ${orderId} not found`);
        res.status(404).json({ error: "Order not found" });
        return;
      }

      if (order.userId !== userId) {
        logger.warn(`Unauthorized attempt to execute order ID: ${orderId} by userId ${userId}`);
        res.status(403).json({ error: "Unauthorized to execute this order" });
        return;
      }

      const price = await PositionService.getPriceForUser(userId);

      if (order.type === "stop-loss" && price <= order.triggerPrice) {
        await OrderService.executeStopLoss(orderId, userId);
        res.status(200).json({ message: "Stop loss executed" });
      } else if (order.type === "take-profit" && price >= order.triggerPrice) {
        await OrderService.executeTakeProfit(orderId, userId);
        res.status(200).json({ message: "Take profit triggered" });
      } else {
        res.status(200).json({ message: "Conditions not met, waiting for the trigger price" });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error executing order for userId ${req.body.userId} and orderId ${req.body.orderId}: ${error.message}`);
        res.status(500).json({ error: "Failed to execute order" });
      } else {
        logger.error("Unknown error occurred while executing order");
        res.status(500).json({ error: "Failed to execute order" });
      }
    }
  }

  // Method to start price simulation
  static async startPriceSimulation(req: Request, res: Response): Promise<void> {
    try {
      // Start simulating price updates (trigger the price simulation every second)
      PriceSimulationService.simulatePriceUpdates();
      res.status(200).json({ message: "Price simulation started" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error starting price simulation: ${error.message}`);
        res.status(500).json({ error: "Failed to start price simulation" });
      } else {
        logger.error("Unknown error occurred while starting price simulation");
        res.status(500).json({ error: "Failed to start price simulation" });
      }
    }
  }
}
