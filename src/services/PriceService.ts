import axios from "axios";
import { config } from "../utils/config";
import logger from "../utils/logger";

export class PriceService {
  // Modify method to accept a 'pair' argument
  static async fetchCryptoPrice(pair: string): Promise<number> {
    console.log(`Fetching price for pair: ${pair}`);

    try {
      // Binance API endpoint for getting the price
      const response = await axios.get(`${config.BASE_URL}${pair}`);
      const price = response.data.price;

      if (!price) {
        throw new Error("Price data not available");
      }

      logger.info(`Fetched price for ${pair}: ${price}`);
      // float for further calculations
      return parseFloat(price);
    } catch (error: unknown) {
      logger.error(`Error fetching price for ${pair}:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch crypto price for pair ${pair}: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching crypto price.");
      }
    }
  }
}
