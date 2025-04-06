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

function getErrorDetails(errorCode: string): { title: string; message: string; action: string } {
  const errors = {
    'no_token': {
      title: 'Missing Booking Token',
      message: 'A valid booking token is required to access this page.',
      action: 'Please use the link provided to you or contact the meeting host.'
    },
    'invalid_token': {
      title: 'Invalid Booking Token',
      message: 'The booking token is invalid or has expired.',
      action: 'Please request a new booking link from the meeting host.'
    },
    'no_slots': {
      title: 'No Available Slots',
      message: 'There are no available time slots for the selected date.',
      action: 'Please select a different date or contact the meeting host.'
    },
    'booking_failed': {
      title: 'Booking Failed',
      message: 'We couldn\'t complete your booking at this time.',
      action: 'Please try again or contact the meeting host directly.'
    },
    'missing_info': {
      title: 'Missing Information',
      message: 'Some required booking information is missing.',
      action: 'Please start the booking process again from the beginning.'
    },
    'default': {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred during the booking process.',
      action: 'Please refresh the page or try again later.'
    }
  };
  
  return errors[errorCode as keyof typeof errors] || errors.default;
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
        let tokenValue = getBookingToken();
        
        // If token not found from WebApp or URL params, check directly
        if (!tokenValue && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          tokenValue = urlParams.get('token');
        }
        
        if (!tokenValue) {
          setError('no_token');
          setStep(BookingStep.ERROR);
          return;
        }
        
        setToken(tokenValue);
        
        // Validate token
        const isValid = await validateToken(tokenValue);
        if (!isValid) {
          setError('invalid_token');
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
        setError('default');
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
        
        if (slots.length === 0) {
          setError('no_slots');
          setStep(BookingStep.ERROR);
          return;
        }
        
        setSelectedSlot(null);
        setStep(BookingStep.SELECT_TIME);
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('default');
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
        setError('missing_info');
        setStep(BookingStep.ERROR);
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
        setError('booking_failed');
        setStep(BookingStep.ERROR);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('booking_failed');
      setStep(BookingStep.ERROR);
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
        const errorDetails = getErrorDetails(error || 'default');
        return (
          <div className="bg-gray-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-500">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">{errorDetails.title}</h3>
            <p className="text-gray-700 mb-3">{errorDetails.message}</p>
            <p className="text-sm text-gray-600 mb-5">{errorDetails.action}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.refresh()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <a
                href="https://t.me/roadto150MBot"
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Contact Host
              </a>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Book a Meeting</h1>
      {renderContent()}
    </div>
  );
} 