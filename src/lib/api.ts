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

// New interfaces for progress analytics
export interface PerformanceMetrics {
  avg_gain: number;
  avg_gain_percent_of_target: number;
  cycles_above_target: number;
  cycles_success_rate: number;
  bot_uptime_percent: number;
  kid_interruption_hours: number;
  gym_attendance_percent: number;
  sleep_average_hours: number;
}

export interface ProgressMetrics {
  daily_growth: number;
  annual_growth: number;
  years_to_goal: number;
  estimated_completion_date: string;
  current_value: number;
  progress_percent: number;
}

export interface ProgressData {
  stats: any;
  formatted: {
    performance: PerformanceMetrics;
    progress: ProgressMetrics;
  };
  initial_investment: number;
  target_gain: number;
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

// Get progress analytics data
export const getProgressAnalytics = async (token: string): Promise<ProgressData | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/progress/stats?token=${token}`);
    if (response.data.status === 'ok') {
      return response.data.data;
    } else {
      console.error('Error fetching progress data:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching progress analytics:', error);
    return null;
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