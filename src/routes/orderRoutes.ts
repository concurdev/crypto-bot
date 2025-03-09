import express from "express";
import { OrderController } from "../controllers/OrderController";

const router = express.Router();

// Create a new order (e.g., stop-loss, take-profit)
router.post("/orders/create", OrderController.createOrder);

// Get all orders for a user
router.get("/orders/:userId", OrderController.getOrdersByUserId);

// Check an order status (trigger price)
router.post("/orders/check", OrderController.checkOrder);

// Execute order based on market conditions
router.post("/orders/execute", OrderController.executeOrder);

export default router;
