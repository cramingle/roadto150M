import React from 'react';
import { format, parseISO } from 'date-fns';
import Calendar from 'react-calendar';
import { DateInfo } from '@/lib/api';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  availableDates: DateInfo[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

type CalendarValue = Date | null | [Date | null, Date | null];

export const CalendarView: React.FC<CalendarViewProps> = ({
  availableDates,
  selectedDate,
  onSelectDate,
}) => {
  // Convert availableDates to a Set for easy checking
  const availableDateSet = new Set(availableDates.map(d => d.date));
  
  // Handle date change
  const handleDateChange = (value: CalendarValue) => {
    if (value instanceof Date) {
      const formattedDate = format(value, 'yyyy-MM-dd');
      if (availableDateSet.has(formattedDate)) {
        onSelectDate(formattedDate);
      }
    }
  };
  
  // Custom tile content to highlight available dates
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const isAvailable = availableDateSet.has(formattedDate);
      
      return (
        <div className={`${isAvailable ? 'bg-green-100 rounded-full' : ''}`}>
          {date.getDate()}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate ? parseISO(selectedDate) : null}
          tileContent={tileContent}
          tileDisabled={({ date }: { date: Date }) => !availableDateSet.has(format(date, 'yyyy-MM-dd'))}
          minDate={new Date()}
          maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
          className="react-calendar"
        />
      </div>
      
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="font-medium">
            Selected: {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      )}
    </div>
  );
}; 