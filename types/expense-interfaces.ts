export interface IExpense {
  description: string;
  amount: number;
  date: Date;
  category: string;
  recordedBy: string; // User ID or name of the admin who recorded it
  createdAt?: Date;
  updatedAt?: Date;
}
