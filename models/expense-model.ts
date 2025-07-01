import mongoose, { Schema, Document, models, Model } from "mongoose";
import { IExpense } from "@/types/expense-interfaces";

export interface IExpenseDocument extends IExpense, Document {}

const ExpenseSchema: Schema<IExpenseDocument> = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);

const Expense: Model<IExpenseDocument> = models.Expense || mongoose.model<IExpenseDocument>("Expense", ExpenseSchema);

export default Expense;
