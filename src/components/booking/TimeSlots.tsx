import React from 'react';
import { TimeSlot } from '@/lib/api';

interface TimeSlotsProps {
  timeSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  timeSlots,
  selectedSlot,
  onSelectSlot,
}) => {
  if (timeSlots.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Available Times</h2>
        <p className="text-gray-500">No time slots available for the selected date.</p>
      </div>
    );
  }
  
  const isSelected = (slot: TimeSlot) => {
    return selectedSlot &&
      selectedSlot.start === slot.start &&
      selectedSlot.end === slot.end;
  };
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Available Times</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {timeSlots.map((slot, index) => (
          <button
            key={index}
            className={`
              p-3 rounded-md border text-center transition-colors
              ${isSelected(slot)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white hover:bg-blue-50 border-gray-300'
              }
            `}
            onClick={() => onSelectSlot(slot)}
          >
            {slot.start} - {slot.end}
          </button>
        ))}
      </div>
    </div>
  );
}; 