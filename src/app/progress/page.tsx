'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBookingToken, initTelegramWebApp } from '@/lib/telegram';
import { getProgressAnalytics, ProgressData } from '@/lib/api';

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  
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
        setError('No booking token found. Please use the link provided to you.');
        setLoading(false);
        return;
      }
      
      try {
        const data = await getProgressAnalytics(token);
        if (data) {
          setProgressData(data);
        } else {
          setError('Unable to fetch progress data. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('An error occurred while loading the data.');
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
    return (
      <div className="px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={() => router.back()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
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
  
  const { formatted, initial_investment, target_gain } = progressData;
  const { performance, progress } = formatted;
  
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
            <p className="text-2xl font-bold">{formatCurrency(progress.current_value)}</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold opacity-80">Target</h3>
            <p className="text-2xl font-bold">$150,000,000</p>
          </div>
        </div>
        
        <div className="h-4 bg-blue-300 bg-opacity-30 rounded-full mb-2 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500" 
            style={{ width: getProgressBarWidth(progress.progress_percent, 100) }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>{progress.progress_percent.toFixed(6)}% complete</span>
          <span>Projection: {progress.years_to_goal.toFixed(1)} years</span>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <h3 className="text-xl font-bold mb-4">Trading Performance</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Average Gain</span>
              <span className="font-medium">{performance.avg_gain.toFixed(4)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(performance.avg_gain_percent_of_target, 150) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {performance.avg_gain_percent_of_target.toFixed(1)}% of target
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Cycle Success Rate</span>
              <span className="font-medium">{performance.cycles_success_rate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(performance.cycles_success_rate, 100) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {performance.cycles_above_target} / 21 cycles above target
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Bot Uptime</span>
              <span className="font-medium">{performance.bot_uptime_percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(performance.bot_uptime_percent, 100) }}
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
            <p className="text-xl font-semibold">{progress.daily_growth.toFixed(4)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Annual Growth</h4>
            <p className="text-xl font-semibold">{progress.annual_growth.toFixed(2)}%</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Start Amount</h4>
            <p className="text-xl font-semibold">{formatCurrency(initial_investment)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm text-gray-500 mb-1">Estimated Achievement</h4>
            <p className="text-xl font-semibold">{progress.estimated_completion_date}</p>
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
              <span className="font-medium">{performance.gym_attendance_percent.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(performance.gym_attendance_percent, 100) }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Sleep Quality</span>
              <span className="font-medium">{performance.sleep_average_hours.toFixed(1)} hrs</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(performance.sleep_average_hours, 8) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {(performance.sleep_average_hours/8*100).toFixed(0)}% of optimal
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Kid Interruption Time</span>
              <span className="font-medium">{performance.kid_interruption_hours.toFixed(1)} hrs</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: getProgressBarWidth(2 - Math.min(performance.kid_interruption_hours, 2), 2) }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {(100 - Math.min(performance.kid_interruption_hours/2, 1)*100).toFixed(0)}% efficient
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