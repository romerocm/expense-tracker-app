'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { ThemeToggle } from '../components/theme-toggle';
import { ExpenseForm } from '../components/expense/ExpenseForm';
import { ExpenseList } from '../components/expense/ExpenseList';
import { Overview } from '../components/dashboard/Overview';
import { DateRangePicker } from '../components/expense/DateRangePicker';
import { Modal } from '../components/ui/modal';
import { PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="glass sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Expense Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Expense</span>
              </button>
              <ThemeToggle />
              <button
                onClick={logout}
                className="flex items-center space-x-2 glass px-4 py-2 rounded-md hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Overview dateRange={dateRange} />
            <ExpenseList dateRange={dateRange} />
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}