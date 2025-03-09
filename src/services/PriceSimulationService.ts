import { PriceService } from "./PriceService";
import { OrderService } from "./OrderService";
import logger from "../utils/logger";

export class PriceSimulationService {
  static async simulatePriceUpdates() {
    // Simulate periodic price updates
    setInterval(async () => {
      try {
        // Simulate fetching the latest price (e.g., BTC price)
        const currentPrice = await PriceService.fetchCryptoPrice("BTCUSDT");

        logger.info(`Simulated Price Update: BTCUSDT - ${currentPrice}`);

        // Check all active orders for stop-loss conditions
        const orders = await OrderService.getOrdersByUserId(1); // Example user ID

        for (const order of orders) {
          if (order.type === "stop-loss" && currentPrice <= order.triggerPrice) {
            logger.info(`Stop-loss triggered for Order ID: ${order.id}`);
            // execute stop-loss for user ID 1
            await OrderService.executeStopLoss(order.id, 1);
          }
        }
      } catch (error) {
        logger.error("Error simulating price updates:", error);
      }
    }, 1000); // simulate price update every second
  }
}
