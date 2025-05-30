'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBookingToken, initTelegramWebApp } from '@/lib/telegram';
import { getProgressAnalytics, ProgressData } from '@/lib/api';

interface ProgressMetrics {
  daily_growth?: number;
  annual_growth?: number;
  current_value?: number;
  progress_percent?: number;
  years_to_goal?: number;
  estimated_completion_date?: string;
}

interface ProgressStateData {
  has_data: boolean;
  message?: string;
  stats?: any;
  formatted_stats?: string;
  initial_investment?: number;
  target_gain?: number;
  progress?: ProgressMetrics;
}

function getErrorDetails(errorCode: string): { title: string; message: string; action: string } {
  const errors = {
    'no_token': {
      title: 'Missing Access Token',
      message: 'A valid token is required to view the progress analytics.',
      action: 'Please use the link provided to you or contact the host.'
    },
    'invalid_token': {
      title: 'Invalid Access Token',
      message: 'The token is invalid or has expired.',
      action: 'Please request a new link from the host.'
    },
    'data_unavailable': {
      title: 'Analytics Not Started',
      message: 'The host has not started tracking their progress yet.',
      action: 'Please check back later or contact the host.'
    },
    'default': {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred while loading the analytics.',
      action: 'Please refresh the page or try again later.'
    }
  };
  
  return errors[errorCode as keyof typeof errors] || errors.default;
}

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressStateData | null>(null);
  
  useEffect(() => {
    initTelegramWebApp();
    const fetchData = async () => {
      setLoading(true);
      
      // First try to get token from Telegram WebApp
      let token = getBookingToken();
      
      // If not found in WebApp, check URL query params directly
      if (!token && typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token');
      }
      
      if (!token) {
        setError('no_token');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/stats?token=${token}`);
        
        if (!response.ok) {
          // Check for specific status codes
          if (response.status === 401 || response.status === 403) {
            setError('invalid_token');
          } else {
            setError('default');
          }
          setLoading(false);
          return;
        }
        
        const responseData = await response.json();
        
        if (responseData.status === 'ok') {
          setProgressData(responseData.data);
          
          // If there's no data yet, we show a specific message but don't treat it as an error
          if (!responseData.data.has_data) {
            // Already handled by the has_data check in the render logic
          }
        } else {
          setError(responseData.message === 'Invalid or missing token' ? 'invalid_token' : 'default');
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('default');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    const errorDetails = getErrorDetails(error || 'default');
    return (
      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Road to $150M</h1>
        <h2 className="text-gray-500 text-center mb-6">Trading Progress Analytics</h2>
        
        <div className="bg-gray-50 border border-red-200 rounded-xl p-6 text-center mb-6">
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
      </div>
    );
  }
  
  if (!progressData) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-700">No data available. Please try again later.</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!progressData.has_data) {
    return (
      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Road to $150M</h1>
        <h2 className="text-gray-500 text-center mb-6">Trading Progress Analytics</h2>
        
        <div className="bg-white rounded-xl shadow-md p-8 mb-6 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3">Journey Just Beginning</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Tracking hasn't started yet. Soon you'll be able to follow the progress toward the $150M goal in real-time.
          </p>
          
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h4 className="font-medium mb-4 text-gray-700">What to expect when tracking begins:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium">Trading Performance</h5>
                  <p className="text-sm text-gray-500">Daily gains & success metrics</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium">Growth Projections</h5>
                  <p className="text-sm text-gray-500">Path to $150M visualized</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="font-medium">Lifestyle Balance</h5>
                  <p className="text-sm text-gray-500">Holistic success tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => router.refresh()} 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Check Again
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
      </div>
    );
  }
  
  const initial_investment = progressData.initial_investment ?? 10000;
  const target_gain = progressData.target_gain ?? 0.1687;
  
  // Safe access with optional chaining and nullish coalescing
  const daily_growth = progressData.progress?.daily_growth ?? 0;
  const annual_growth = progressData.progress?.annual_growth ?? 0;
  const current_value = progressData.progress?.current_value ?? initial_investment;
  const progress_percent = progressData.progress?.progress_percent ?? 0;
  const years_to_goal = progressData.progress?.years_to_goal ?? 0;
  const estimated_completion_date = progressData.progress?.estimated_completion_date ?? 'N/A';
  
  // Calculate progress bars
  const getProgressBarWidth = (value: number, max: number) => {
    return Math.min(Math.round((value / max) * 100), 100) + '%';
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-2 text-center">Road to $150M</h1>
      <h2 className="text-gray-500 text-center mb-6">Trading Progress Analytics</h2>
      
      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 mb-6 text-white shadow-lg">
        <div className="flex justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold opacity-80">Current Value</h3>
            <p className="text-2xl font-bold">{formatCurrency(current_value)}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold opacity-80">Target</h3>
            <p className="text-2xl font-bold">$150,000,000</p>
          </div>
        </div>
        
        <div className="h-4 bg-blue-300 bg-opacity-30 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500" 
            style={{ width: getProgressBarWidth(progress_percent, 100) }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>{progress_percent.toFixed(6)}% complete</span>
          <span>Projection: {years_to_goal.toFixed(1)} years</span>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Trading Performance</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Average Gain</span>
              <span className="font-medium">{progressData.stats?.avg_gain.toFixed(4)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(progressData.stats?.avg_gain_percent_of_target, 150) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {progressData.stats?.avg_gain_percent_of_target.toFixed(1)}% of target
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Cycle Success Rate</span>
              <span className="font-medium">{progressData.stats?.cycles_success_rate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(progressData.stats?.cycles_success_rate, 100) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {progressData.stats?.cycles_above_target} / 21 cycles above target
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Bot Uptime</span>
              <span className="font-medium">{progressData.stats?.bot_uptime_percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(progressData.stats?.bot_uptime_percent, 100) }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Projection */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Growth Projection</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Daily Growth</h4>
            <p className="text-xl font-semibold">{daily_growth.toFixed(4)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Annual Growth</h4>
            <p className="text-xl font-semibold">{annual_growth.toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Start Amount</h4>
            <p className="text-xl font-semibold">{formatCurrency(initial_investment)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Estimated Achievement</h4>
            <p className="text-xl font-semibold">{estimated_completion_date}</p>
          </div>
        </div>
      </div>
      
      {/* Lifestyle Metrics */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Lifestyle Metrics</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Gym Attendance</span>
              <span className="font-medium">{progressData.stats?.gym_attendance_percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(progressData.stats?.gym_attendance_percent, 100) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Sleep Quality</span>
              <span className="font-medium">{progressData.stats?.sleep_average_hours.toFixed(1)} hrs</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(progressData.stats?.sleep_average_hours, 8) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {(progressData.stats?.sleep_average_hours/8*100).toFixed(0)}% of optimal
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Kid Interruption Time</span>
              <span className="font-medium">{progressData.stats?.kid_interruption_hours.toFixed(1)} hrs</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(2 - Math.min(progressData.stats?.kid_interruption_hours, 2), 2) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {(100 - Math.min(progressData.stats?.kid_interruption_hours/2, 1)*100).toFixed(0)}% efficient
            </div>
          </div>
        </div>
      </div>
      
      {/* Back Button */}
      <div className="text-center mb-6">
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Booking
        </button>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Analytics for journey to $150M • Target daily gain: {target_gain.toFixed(4)}%
        </p>
      </div>
    </div>
  );
} 