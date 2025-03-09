import express from "express";
import bodyParser from "body-parser";
import orderRoutes from "./routes/orderRoutes";
import userRoutes from "./routes/userRoutes";
import { config } from "./utils/config";
import logger from "./utils/logger";
import { WebSocketService } from "./services/WebSocketService";
import { OrderService } from "./services/OrderService"; // Make sure you import OrderService

const app = express();

// Initialize WebSocket service
const websocketService = new WebSocketService(config.BROADCAST_PORT);

// Pass the WebSocket server to OrderService to enable broadcasting
OrderService.initializeWebSocketServer(websocketService.wss);

app.use(bodyParser.json());

// Use order routes and user routes
app.use("/api", orderRoutes);
app.use("/api", userRoutes);

app.listen(config.PORT, () => {
  logger.info(`Server is running at http://${config.HOST}:${config.PORT}`);
});
