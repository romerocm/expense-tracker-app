'use client';

import { useEffect } from 'react';
import { useExpenseStore } from '@/app/store/expenseStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useTheme } from 'next-themes';
import { Expense } from '@/app/types/expense';
import { useExpenses } from '@/app/hooks/useExpenses';

interface OverviewProps {
  dateRange?: DateRange;
}

export function Overview({ dateRange }: OverviewProps) {
  const { expenses, loading, error } = useExpenses();
  const { theme } = useTheme();

  const filteredExpenses = (expenses || []).filter((expense: Expense) => {
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

  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by date for the chart
  const dailyExpenses = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    const date = format(new Date(expense.date), 'MMM d');
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += expense.amount;
    return acc;
  }, {});

  const chartData = Object.entries(dailyExpenses)
    .map(([date, amount]) => ({ date, amount }))
    .slice(-7);

  if (loading) {
    return (
      <div className="glass rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-primary/20 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-primary/20 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-primary/20 rounded w-1/2 mb-6"></div>
          <div className="h-[300px] bg-primary/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Spending Overview</h3>
      {error && (
        <div className="mb-4 p-4 rounded-md bg-destructive/10 text-destructive">
          <p>{error}</p>
        </div>
      )}
      
      <p className="text-3xl font-semibold">${totalSpent.toFixed(2)}</p>
      <p className="text-sm text-muted-foreground mb-6">Total spending</p>
      
      {filteredExpenses.length > 0 && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}
              />
              <YAxis 
                stroke={theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                labelStyle={{
                  color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}