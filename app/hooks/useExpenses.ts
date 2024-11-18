import { useState, useEffect } from 'react';
import { ref, onValue, DataSnapshot } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Expense } from '../types/expense';

const handleDatabaseError = (error: Error): string => {
  console.error('Database Error:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });

  switch (error.code) {
    case 'PERMISSION_DENIED':
      return 'You don\'t have permission to access this data';
    case 'UNAVAILABLE':
      return 'Service is temporarily unavailable. Please try again later';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection';
    default:
      return `Database error: ${error.message}`;
  }
};

const processExpenseData = (snapshot: DataSnapshot): Expense[] => {
  const data = snapshot.val();
  if (!data) return [];

  try {
    return Object.entries(data).map(([id, expenseData]) => {
      const expense = expenseData as any;
      // Ensure date is a valid number, fallback to createdAt or current time
      const date = typeof expense.date === 'number' ? expense.date : 
                  typeof expense.createdAt === 'number' ? expense.createdAt :
                  Date.now();

      return {
        id,
        description: expense.description || '',
        amount: Number(expense.amount) || 0,
        createdAt: expense.createdAt || date,
        date: date,
        note: expense.note || '',
        userId: expense.userId || ''
      };
    }).sort((a, b) => b.date - a.date); // Sort by date descending
  } catch (error) {
    console.error('Error processing expense data:', error);
    throw new Error('Failed to process expense data');
  }
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.info('No user is logged in');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.info('Setting up real-time expense subscription for user:', user.uid);
    const expensesRef = ref(db, `users/${user.uid}/expenses`);

    const unsubscribe = onValue(
      expensesRef, 
      (snapshot) => {
        try {
          console.info('Received real-time update');
          const expensesArray = processExpenseData(snapshot);
          console.info(`Processed ${expensesArray.length} expenses`);
          
          setExpenses(expensesArray);
          setLastSync(new Date());
          setError(null);
        } catch (error) {
          console.error('Error processing expenses:', error);
          setError('Failed to process expense data');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        const errorMessage = handleDatabaseError(error);
        console.error('Subscription error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => {
      console.info('Cleaning up expense subscription');
      unsubscribe();
    };
  }, [user]);

  return { expenses, loading, error, lastSync };
}
