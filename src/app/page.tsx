'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBookingToken, initTelegramWebApp } from '@/lib/telegram';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'default' | 'select'>(('default'));
  
  // Initialize Telegram web app and check for token
  useEffect(() => {
    initTelegramWebApp();
    
    // First try to get token from Telegram WebApp
    let token = getBookingToken();
    
    // If not found in WebApp, check URL query params directly
    if (!token && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
      
      // Check if there's a view parameter
      const view = urlParams.get('view');
      if (view === 'select') {
        setViewType('select');
      }
    }
    
    if (token) {
      // Check for direct progress view request
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const viewParam = urlParams.get('view');
        
        if (viewParam === 'progress') {
          router.push(`/progress?token=${token}`);
        } else {
          router.push(`/booking?token=${token}`);
        }
      } else {
        router.push(`/booking?token=${token}`);
      }
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (viewType === 'select') {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">RoadTo150M</h1>
        <p className="text-lg mb-8 text-gray-600">
          Choose what you'd like to access
        </p>
        
        <div className="space-y-6 max-w-sm mx-auto">
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-2">📊 Trading Progress Analytics</h2>
            <p className="mb-4 opacity-90">View the journey to $150M with detailed metrics and projections</p>
            <Link href="/progress" className="inline-block py-3 px-6 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors w-full">
              View Analytics
            </Link>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-2">📅 Book an Appointment</h2>
            <p className="mb-4 opacity-90">Schedule a meeting at your preferred date and time</p>
            <Link href="/booking" className="inline-block py-3 px-6 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors w-full">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">RoadTo150M Booking</h1>
      <p className="text-lg mb-8 text-gray-600">
        Schedule meetings with ease
      </p>
      
      <div className="rounded-xl bg-gray-100 p-5 mb-8">
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <ol className="text-left space-y-3 mb-4">
          <li className="flex gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">1</span>
            <span>Access via Telegram bot invitation</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">2</span>
            <span>Select an available date</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">3</span>
            <span>Choose your preferred time slot</span>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">4</span>
            <span>Fill details and confirm booking</span>
          </li>
        </ol>
        
        <p className="italic text-sm text-gray-500 mt-2">
          This app is designed for Telegram Mini Apps.
        </p>
      </div>
      
      <Link href="/booking" className="inline-block py-3 px-8 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
        Book Now
      </Link>
    </div>
  );
}
