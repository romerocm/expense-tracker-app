'use client';

import { useState, useEffect, useRef } from 'react';
import { format, addMonths, setYear } from 'date-fns';
import { DateRange, DayPicker } from 'react-day-picker';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Modal } from '../ui/modal';
import { cn } from '@/app/lib/utils';

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);

  let buttonText = 'Select dates';
  if (dateRange?.from) {
    if (!dateRange.to) {
      buttonText = format(dateRange.from, 'MMM d, yyyy');
    } else if (dateRange.to) {
      buttonText = `${format(dateRange.from, 'MMM d')} - ${format(
        dateRange.to,
        'MMM d, yyyy'
      )}`;
    }
  }

  const handlePreviousMonth = () => {
    setMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setMonth(prev => addMonths(prev, 1));
  };

  const handleYearSelect = (year: number) => {
    setMonth(setYear(month, year));
    setYearPickerOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 glass px-4 py-2 rounded-md hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
      >
        <CalendarIcon className="h-5 w-5" />
        <span>{buttonText}</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Date Range"
      >
        <div ref={modalContentRef} className="p-4">
          <div className="flex items-center justify-between mb-6 px-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setYearPickerOpen(!yearPickerOpen)}
              className="text-lg font-medium hover:text-primary transition-colors px-4"
            >
              {format(month, 'MMMM yyyy')}
            </button>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {yearPickerOpen ? (
            <div className="grid grid-cols-4 gap-2 p-2 max-h-[280px] overflow-y-auto">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    year === month.getFullYear()
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <DayPicker
              mode="range"
              selected={dateRange}
              month={month}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              showOutsideDays={false}
              className="!w-full rdp-animation"
              classNames={{
                months: "flex space-x-6",
                month: "space-y-4 first:ml-0",
                caption: "flex justify-center pt-1 relative items-center h-10",
                caption_label: "text-sm font-medium",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: cn(
                  "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  "uppercase tracking-wider text-center"
                ),
                row: "flex w-full mt-2",
                cell: cn(
                  "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                  "[&:has([aria-selected])]:bg-primary/20 dark:[&:has([aria-selected])]:bg-primary/40"
                ),
                day: cn(
                  "h-9 w-9 p-0 font-normal",
                  "rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "aria-selected:opacity-100",
                  "transition-all duration-200 ease-in-out"
                ),
                day_selected: cn(
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                  "focus:bg-primary focus:text-primary-foreground"
                ),
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-primary/20 dark:aria-selected:bg-primary/40 aria-selected:text-foreground",
                day_hidden: "invisible",
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}