'use client';

import { useExpenses } from '../../hooks/useExpenses';
import { useExpenseStore } from '../../store/expenseStore';
import { format } from 'date-fns';
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/confirm-dialog';

interface ExpenseListProps {
  dateRange?: DateRange;
}

export function ExpenseList({ dateRange }: ExpenseListProps) {
  const { expenses, loading, error } = useExpenses();
  const { deleteExpense } = useExpenseStore();
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const filteredExpenses = (expenses || []).filter((expense) => {
    if (!dateRange?.from) return true;

    const expenseDate = new Date(expense.date);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;

    if (from) {
      from.setHours(0, 0, 0, 0);
      if (!to) return expenseDate >= from;
      
      to.setHours(23, 59, 59, 999);
      return expenseDate >= from && expenseDate <= to;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="glass rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Recent Expenses</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-primary/10 rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const formatExpenseDate = (timestamp: number) => {
    return format(new Date(timestamp), 'MMM d, yyyy');
  };

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Recent Expenses</h3>
      
      {error && (
        <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {!filteredExpenses || filteredExpenses.length === 0 ? (
          <p className="text-muted-foreground">No expenses recorded yet</p>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 rounded-md bg-background"
            >
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatExpenseDate(expense.date)}
                  {expense.note && ` · ${expense.note}`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium">
                  ${expense.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => setExpenseToDelete(expense.id)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete);
          }
        }}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
}