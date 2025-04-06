import { useState } from 'react';
import { TimeSlot, DateInfo } from '@/lib/api';
import { BookingFormData } from '@/components/booking/BookingForm';

export enum BookingStep {
  LOADING,
  SELECT_DATE,
  SELECT_TIME,
  FILL_FORM,
  CONFIRM,
  ERROR
}

export const useBooking = () => {
  const [step, setStep] = useState<BookingStep>(BookingStep.LOADING);
  const [token, setToken] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<DateInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    title: '',
    description: ''
  });

  // Reset booking state
  const resetBooking = () => {
    setStep(BookingStep.LOADING);
    setToken(null);
    setAvailableDates([]);
    setSelectedDate(null);
    setTimeSlots([]);
    setSelectedSlot(null);
    setError(null);
    setBookingId(null);
    setFormData({
      name: '',
      email: '',
      title: '',
      description: ''
    });
  };
  
  return {
    step,
    setStep,
    token,
    setToken,
    availableDates,
    setAvailableDates,
    selectedDate,
    setSelectedDate,
    timeSlots,
    setTimeSlots,
    selectedSlot,
    setSelectedSlot,
    error,
    setError,
    bookingId,
    setBookingId,
    formData,
    setFormData,
    resetBooking
  };
}; 