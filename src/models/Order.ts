export class Order {
  id: number;
  userId: number;
  type: "stop-loss" | "take-profit";
  triggerPrice: number;
  status: "active" | "executed" | "cancelled";

  constructor(id: number, userId: number, type: "stop-loss" | "take-profit", triggerPrice: number) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.triggerPrice = triggerPrice;
    this.status = "active";
  }
}
