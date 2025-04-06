'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  validateToken, 
  getAvailableDates, 
  getTimeSlots, 
  createBooking,
  DateInfo,
  TimeSlot
} from '@/lib/api';
import { 
  initTelegramWebApp,
  getTelegramUser,
  getBookingToken,
  showMainButton,
  hideMainButton
} from '@/lib/telegram';
import { CalendarView } from '@/components/booking/CalendarView';
import { TimeSlots } from '@/components/booking/TimeSlots';
import { BookingForm, BookingFormData } from '@/components/booking/BookingForm';

enum BookingStep {
  LOADING,
  SELECT_DATE,
  SELECT_TIME,
  FILL_FORM,
  CONFIRM,
  ERROR
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>(BookingStep.LOADING);
  const [token, setToken] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize and validate token
  useEffect(() => {
    const initBooking = async () => {
      try {
        // Initialize Telegram Web App
        initTelegramWebApp();
        
        // Get token from URL or Telegram
        const tokenValue = getBookingToken();
        if (!tokenValue) {
          setError('No booking token provided');
          setStep(BookingStep.ERROR);
          return;
        }
        
        setToken(tokenValue);
        
        // Validate token
        const isValid = await validateToken(tokenValue);
        if (!isValid) {
          setError('Invalid or expired booking link');
          setStep(BookingStep.ERROR);
          return;
        }
        
        // Get available dates
        const dates = await getAvailableDates(tokenValue);
        setAvailableDates(dates);
        
        // Move to date selection
        setStep(BookingStep.SELECT_DATE);
      } catch (error) {
        console.error('Error initializing booking:', error);
        setError('Failed to initialize booking');
        setStep(BookingStep.ERROR);
      }
    };
    
    initBooking();
  }, []);
  
  // Handle date selection
  const handleSelectDate = async (date: string) => {
    try {
      setSelectedDate(date);
      
      if (token) {
        const slots = await getTimeSlots(token, date);
        setTimeSlots(slots);
        setSelectedSlot(null);
        setStep(BookingStep.SELECT_TIME);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to fetch available times');
      setStep(BookingStep.ERROR);
    }
  };
  
  // Handle time slot selection
  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep(BookingStep.FILL_FORM);
  };
  
  // Handle form submission
  const handleSubmitForm = async (formData: BookingFormData) => {
    try {
      if (!token || !selectedDate || !selectedSlot) {
        setError('Missing booking information');
        return;
      }
      
      // Get user ID from Telegram if available
      const telegramUser = getTelegramUser();
      const telegramId = telegramUser?.id.toString();
      
      // Create booking
      const result = await createBooking(token, {
        ...formData,
        date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        telegram_id: telegramId
      });
      
      if (result.success) {
        // Redirect to confirmation page
        router.push(`/confirmation?booking_id=${result.booking_id}`);
      } else {
        setError(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking');
    }
  };
  
  // Render based on current step
  const renderContent = () => {
    switch (step) {
      case BookingStep.LOADING:
        return (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        );
        
      case BookingStep.SELECT_DATE:
        return (
          <CalendarView
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        );
        
      case BookingStep.SELECT_TIME:
        return (
          <>
            <CalendarView
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
            <TimeSlots
              timeSlots={timeSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          </>
        );
        
      case BookingStep.FILL_FORM:
        if (!selectedDate || !selectedSlot) {
          return <div>Error: Missing booking information</div>;
        }
        
        return (
          <BookingForm
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSubmit={handleSubmitForm}
            onBack={() => setStep(BookingStep.SELECT_TIME)}
          />
        );
        
      case BookingStep.ERROR:
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <p className="text-red-600 font-medium">{error || 'An error occurred'}</p>
            <button
              onClick={() => router.refresh()}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Book a Meeting</h1>
      {renderContent()}
    </div>
  );
} 