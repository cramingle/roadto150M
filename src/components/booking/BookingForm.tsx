import React, { useState } from 'react';
import { TimeSlot } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface BookingFormProps {
  selectedDate: string;
  selectedSlot: TimeSlot;
  onSubmit: (formData: BookingFormData) => void;
  onBack: () => void;
}

export interface BookingFormData {
  name: string;
  email: string;
  title: string;
  description: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    title: '',
    description: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Format date for display
  const formattedDate = format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy');
  
  return (
    <div className="mt-4">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 mb-4"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </button>
      
      <div className="p-4 tg-secondary-bg rounded-lg mb-6">
        <h3 className="font-medium text-lg">Booking Details</h3>
        <p className="text-gray-700">Date: {formattedDate}</p>
        <p className="text-gray-700">Time: {selectedSlot.start} - {selectedSlot.end}</p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Your Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="you@example.com"
          />
        </div>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Meeting Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Brief title for the meeting"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Meeting Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="form-input"
            placeholder="Any additional details or agenda"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="tg-button w-full py-3"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
}; 