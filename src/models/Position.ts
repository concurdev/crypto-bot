export class Position {
  userId: number;
  token: string;
  amount: number;
  entryPrice: number;

  constructor(userId: number, token: string, amount: number, entryPrice: number) {
    this.userId = userId;
    this.token = token;
    this.amount = amount;
    this.entryPrice = entryPrice;
  }

  closePosition() {
    this.amount = 0;
  }
}
