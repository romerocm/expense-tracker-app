export interface Expense {
  id: string;
  description: string;
  amount: number;
  createdAt: number;
  date: number;
  note?: string;
  userId: string;
}

export type ExpenseFormData = {
  description: string;
  amount: number;
  date: number;
  note?: string;
};