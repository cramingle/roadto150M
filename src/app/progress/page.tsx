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
        setError('No booking token found. Please use the link provided to you.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/progress/stats?token=${token}`);
        const responseData = await response.json();
        
        if (responseData.status === 'ok') {
          setProgressData(responseData.data);
        } else {
          setError(responseData.message || 'Unable to fetch progress data. Please try again later.');
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
  
  if (!progressData.has_data) {
    return (
      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-center">Road to $150M</h1>
        <h2 className="text-gray-500 text-center mb-6">Trading Progress Analytics</h2>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 mb-6 text-white shadow-lg">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Journey Just Beginning</h3>
            <p className="text-center">
              Tracking hasn't started yet. Soon you'll see progress toward the $150M goal.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <h3 className="text-xl font-bold mb-4">What You'll See Here</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">📈</div>
              <div>
                <h4 className="font-medium">Trading Performance</h4>
                <p className="text-sm text-gray-600">Average gains, cycle success rates, and bot uptime</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">🚀</div>
              <div>
                <h4 className="font-medium">Growth Projection</h4>
                <p className="text-sm text-gray-600">Daily and annual growth, time to reach $150M</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">💪</div>
              <div>
                <h4 className="font-medium">Lifestyle Metrics</h4>
                <p className="text-sm text-gray-600">Gym attendance, sleep quality, and work-life balance</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <button 
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Booking
          </button>
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