import { create } from 'zustand';
import { ref, push, remove, set } from 'firebase/database';
import { db, auth } from '../firebase';
import { ExpenseFormData } from '../types/expense';

interface ExpenseState {
  error: string | null;
  addExpense: (data: ExpenseFormData) => Promise<string | undefined>;
  deleteExpense: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const useExpenseStore = create<ExpenseState>((set) => ({
  error: null,
  
  setError: (error: string | null) => set({ error }),
  
  addExpense: async (data: ExpenseFormData) => {
    console.log('addExpense called with data:', data);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Must be logged in to add expenses');
      }

      // Reset any previous errors
      set({ error: null });

      // Create the expense data
      const expenseData = {
        ...data,
        createdAt: Date.now(),
        userId: user.uid,
      };

      // Reference to user's expenses
      const expensesRef = ref(db, `users/${user.uid}/expenses`);

      // Push the new expense directly
      const result = await push(expensesRef, expenseData);
      
      console.log('Expense added successfully:', result.key);
      return result.key || undefined;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add expense';
      set({ error: message });
      throw error;
    }
  },
  
  deleteExpense: async (id: string) => {
    try {
      set({ error: null });
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Must be logged in to delete expenses');
      }

      const expenseRef = ref(db, `users/${user.uid}/expenses/${id}`);
      await remove(expenseRef);
      console.log('Expense deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete expense';
      set({ error: message });
      throw new Error(message);
    }
  },
}));

export { useExpenseStore };
