import axios from 'axios';

// Base API URL pointing to your bot's API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DateInfo {
  date: string;
  day_of_week: string;
  has_slots: boolean;
}

// Validate booking token
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/booking/validate`, { token });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// Get available dates
export const getAvailableDates = async (token: string): Promise<DateInfo[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/booking/dates?token=${token}`);
    return response.data.status === 'ok' ? response.data.dates : [];
  } catch (error) {
    console.error('Error fetching available dates:', error);
    return [];
  }
};

// Get time slots for a specific date
export const getTimeSlots = async (token: string, date: string): Promise<TimeSlot[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/booking/slots?token=${token}&date=${date}`);
    return response.data.status === 'ok' ? response.data.slots : [];
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return [];
  }
};

// Create a booking
export const createBooking = async (
  token: string,
  bookingData: {
    name: string;
    email: string;
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    telegram_id?: string;
  }
): Promise<{ success: boolean; booking_id?: string; error?: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/booking/create`, {
      token,
      ...bookingData,
    });
    
    if (response.data.status === 'ok') {
      return { 
        success: true, 
        booking_id: response.data.booking_id 
      };
    } else {
      return { 
        success: false, 
        error: response.data.message || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking' };
  }
}; 