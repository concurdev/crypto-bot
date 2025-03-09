import { OrderService } from "../services/OrderService";
import { Order } from "../models/Order";
import { PositionService } from "../services/PositionService";

// Mocking the OrderService and PositionService methods
jest.mock("../services/OrderService");
jest.mock("../services/PositionService");

describe("OrderService", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should create an order successfully", async () => {
    const order = new Order(0, 1, "stop-loss", 100.0);

    // Mock the database interaction in createOrder to return the order with an ID
    const mockCreateOrder = jest.fn().mockResolvedValue({
      ...order,
      id: 1,
      status: "active",
    });
    OrderService.createOrder = mockCreateOrder;

    const createdOrder = await OrderService.createOrder(order);

    // Validate that the order was created correctly
    expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    expect(createdOrder.id).toBeGreaterThan(0);
    expect(createdOrder.userId).toBe(1);
    expect(createdOrder.type).toBe("stop-loss");
    expect(createdOrder.triggerPrice).toBe(100.0);
    expect(createdOrder.status).toBe("active");
  });

  it("should fetch orders for a user", async () => {
    // Mock the database interaction for getOrdersByUserId
    const mockOrders = [new Order(1, 1, "stop-loss", 100.0), new Order(2, 1, "take-profit", 200.0)];

    const mockGetOrdersByUserId = jest.fn().mockResolvedValue(mockOrders);
    OrderService.getOrdersByUserId = mockGetOrdersByUserId;

    const orders = await OrderService.getOrdersByUserId(1);

    // Validate that orders were fetched successfully
    expect(mockGetOrdersByUserId).toHaveBeenCalledTimes(1);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].userId).toBe(1);
    expect(orders[0].type).toBe("stop-loss");
  });

  it("should execute a stop-loss order", async () => {
    const order = new Order(1, 1, "stop-loss", 100.0);

    // Mock the createOrder function to return the created order
    const mockCreateOrder = jest.fn().mockResolvedValue({
      ...order,
      id: 1,
      status: "active",
    });
    OrderService.createOrder = mockCreateOrder;

    await OrderService.createOrder(order);

    // Mock the PositionService and executeStopLoss method
    const mockPosition = { userId: 1, token: "BTC", amount: 10, entryPrice: 9500 };
    const mockExecuteStopLoss = jest.fn().mockResolvedValue(null);
    OrderService.executeStopLoss = mockExecuteStopLoss;

    const mockGetPositionForUser = jest.fn().mockResolvedValue(mockPosition);
    PositionService.getPositionForUser = mockGetPositionForUser;

    // Mock the updated status of the order after executing the stop-loss
    const mockGetOrderById = jest.fn().mockResolvedValue({
      ...order,
      status: "executed",
    });
    OrderService.getOrderById = mockGetOrderById;

    // Execute stop-loss
    await OrderService.executeStopLoss(order.id, 1);

    // Fetch the updated order
    const updatedOrder = await OrderService.getOrderById(order.id);

    // Add a null check for `updatedOrder`
    if (updatedOrder) {
      // Validate that the stop-loss was executed
      expect(mockExecuteStopLoss).toHaveBeenCalledTimes(1);
      expect(mockGetPositionForUser).toHaveBeenCalledTimes(1);
      expect(updatedOrder.status).toBe("executed");
    } else {
      // Handle the case where the order was not found
      fail("Updated order should not be null");
    }
  });
});
