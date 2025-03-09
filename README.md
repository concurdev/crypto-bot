# Crypto Trading Bot

This is a cryptocurrency trading bot designed to interact with cryptocurrency exchanges like Binance and execute conditional orders based on the market conditions. It supports basic functionality such as stop-loss and take-profit orders and includes real-time updates through WebSockets.

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Database Schema](#database-schema)
- [Services Overview](#services-overview)
- [WebSocket Server](#websocket-server)
- [Price Simulation Service](#price-simulation-service)
- [Logging](#logging)

## Project Structure

The project is organized as follows:

```
crypto-bot/
├── src/
│   ├── controllers/
│   │   ├── OrderController.ts
│   │   └── UserController.ts
│   ├── services/
│   │   ├── OrderService.ts
│   │   ├── PriceSimulationService.ts
│   │   ├── UserService.ts
│   │   ├── WebSocketService.ts
│   ├── models/
│   │   ├── Order.ts
│   │   ├── Position.ts
│   │   └── User.ts
│   ├── utils/
│   │   ├── config.ts
│   │   ├── constants.ts
│   │   ├── logger.ts
│   └── server.ts
└── .env
└── package.json
```

### Services

- **OrderService**: Handles CRUD operations for orders, including stop-loss and take-profit functionality.
- **UserService**: Manages user creation and retrieval.
- **PriceSimulationService**: Simulates periodic price updates and triggers stop-loss orders when conditions are met.
- **WebSocketService**: Manages WebSocket connections for real-time updates.
- **Logger**: Handles application-level logging with color-coded log levels.

## Technologies Used

- **Node.js**: JavaScript runtime for server-side application.
- **TypeScript**: Strongly typed superset of JavaScript for better development experience.
- **Express**: Web framework for creating API routes and handling HTTP requests.
- **MySQL**: Relational database for storing user and order data.
- **WebSocket**: Real-time communication for order execution and price updates.
- **dotenv**: Loads environment variables from a `.env` file.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/concurdev/crypto-bot.git
   cd crypto-bot
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file in the root of the project and configure the following values:

   ```env
   HOST=0.0.0.0
   PORT=6363
   BROADCAST_PORT=7373
   BASE_URL=https://api.binance.com/api/v3/ticker/price?symbol=
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   DB_CONNECTION_LIMIT=10
   ```

4. **Start the application**:

   ```bash
   npm start
   ```

   This will start the application on the configured port (default is 3000).

## Database Schema

The project uses MySQL to store user and order data. Below are the SQL queries to set up the required tables:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(50) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    entry_price DECIMAL(18, 8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('stop-loss', 'take-profit') NOT NULL,
    trigger_price DECIMAL(18, 8) NOT NULL,
    status ENUM('active', 'executed', 'cancelled') NOT NULL DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Services Overview

### OrderService

Responsible for interacting with orders in the database. It contains methods for creating and updating stop-loss and take-profit orders.

```typescript
// OrderService.ts
import { connection } from "../utils/config";
import { Order } from "../models/Order";

// Create new stop-loss or take-profit order
static async createOrder(userId: number, type: string, triggerPrice: number): Promise<Order> {
  // Database interaction code
}
```

### PriceSimulationService

Simulates periodic price updates and checks for active stop-loss orders. When the price reaches the stop-loss trigger price, it executes the stop-loss order.

```typescript
// PriceSimulationService.ts
import { PriceService } from "./PriceService";
import { OrderService } from "./OrderService";

// Simulate periodic price updates
setInterval(async () => {
  // Fetch the current price and check active orders
}, 1000);
```

### UserService

Handles the creation and retrieval of users in the database.

```typescript
// UserService.ts
static async createUser(name: string): Promise<User> {
  // Create a new user in the database
}

static async getAllUsers(): Promise<User[]> {
  // Fetch all users from the database
}
```

### WebSocketService

Manages WebSocket connections for real-time updates. It sends price updates and other messages to connected clients.

```typescript
// WebSocketService.ts
const wss = new WebSocket.Server({ port: 8383 });

// Broadcast price updates to all connected clients
broadcast(message: string): void {
  this.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
```

## WebSocket Server

The WebSocket server runs on port 8383 and broadcasts messages to all connected clients. When a new WebSocket client connects, a welcome message is sent.

```typescript
// WebSocketService.ts
this.wss.on("connection", (ws) => {
  logger.info("New WebSocket connection established");
  ws.send(JSON.stringify({ message: "Welcome to WebSocket server!" }));
});
```

## Price Simulation Service

The price simulation service simulates periodic price updates and checks whether any active orders need to be executed (e.g., stop-loss).

```typescript
// PriceSimulationService.ts
static async simulatePriceUpdates() {
  setInterval(async () => {
    const currentPrice = await PriceService.fetchCryptoPrice("BTCUSDT");
    // Check for stop-loss conditions
  }, 1000);
}
```

## Logging

The project uses **Winston** for logging, providing different log levels (e.g., INFO, ERROR, WARN) with color-coded output for better readability.

```typescript
// logger.ts
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level}] : ${message}`;
    })
  ),
  transports: [new transports.Console()],
});

export default logger;
```

## Running the Client

To interact with the WebSocket server, you can use a simple WebSocket client. You can create a client.ts file to test the WebSocket connection.

    Create a client.ts file with the following content:

```typescript
// client.ts
import WebSocket from "ws";

// WebSocket client connecting to the server
const ws = new WebSocket("ws://localhost:8383");

ws.on("open", () => {
  console.log("WebSocket connection established.");
});

ws.on("message", (data) => {
  console.log("Received string data:", data);
});
```

    Run the client using npx:

```bash
npx ts-node client.ts
```

# Expected Output

Once the WebSocket connection is established, the following output should be shown:

```bash
➜ crypto-bot git:(master) ✗ npx ts-node client.ts
WebSocket connection established.
Received string data: { message: 'Welcome to WebSocket server!' }
```

This shows that the client successfully connected to the WebSocket server and received a welcome message.

---
