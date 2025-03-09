import WebSocket from "ws";
import logger from "../utils/logger";

export class WebSocketService {
  public wss: WebSocket.Server; // Change to public

  constructor(port: number) {
    this.wss = new WebSocket.Server({ port });
    this.setupConnectionHandler();
  }

  private setupConnectionHandler(): void {
    this.wss.on("connection", (ws) => {
      logger.info("New WebSocket connection established");

      // message to the new client
      ws.send(JSON.stringify({ message: "Welcome to WebSocket server!" }));

      // Handle incoming messages
      ws.on("message", (message) => {
        logger.info(`Received message: ${message}`);
      });

      // Handle client disconnection
      ws.on("close", () => {
        logger.info("WebSocket connection closed");
      });
    });
  }

  // Broadcast message to all connected clients
  broadcast(message: string): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
