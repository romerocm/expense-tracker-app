'use client';

import { useState, useRef, useEffect } from 'react';
import { useExpenseStore } from '@/app/store/expenseStore';
import { ExpenseFormData } from '@/app/types/expense';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { addExpense, error: storeError } = useExpenseStore.getState();

  useEffect(() => {
    if (storeError) {
      setFormError(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setNote('');
    setDate(new Date());
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (!amount || isNaN(parseFloat(amount))) {
        throw new Error('Please enter a valid amount');
      }

      if (!description.trim()) {
        throw new Error('Please enter a description');
      }

      const expenseData: ExpenseFormData = {
        amount: parseFloat(amount),
        description: description.trim(),
        date: date.getTime(),
        note: note.trim() || undefined,
      };

      await addExpense(expenseData);
      console.log('Expense added successfully');
      resetForm();
      onSuccess?.();
    } catch (err) {
      console.error('Error adding expense:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
          required
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background"
          required
          placeholder="Enter expense description"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1">
          Date
        </label>
        <button
          type="button"
          ref={buttonRef}
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md border bg-background text-left"
        >
          <span>{format(date, 'MMM d, yyyy')}</span>
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        </button>
        
        {isCalendarOpen && (
          <div
            ref={calendarRef}
            className="absolute z-50 top-full mt-2 p-3 bg-popover rounded-md shadow-md border"
          >
            <DayPicker
              mode="single"
              selected={date}
              onSelect={(date) => {
                if (date) {
                  setDate(date);
                  setIsCalendarOpen(false);
                }
              }}
              initialFocus
              className="rdp-animation"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium mb-1">
          Note (Optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background resize-none"
          rows={3}
          placeholder="Add any additional notes"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
      >
        Add Expense
      </button>
    </form>
  );
}
