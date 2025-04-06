'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBookingToken } from '@/lib/telegram';

export default function Home() {
  const router = useRouter();
  
  // Check for token and redirect if available
  useEffect(() => {
    // First try to get token from Telegram WebApp
    let token = getBookingToken();
    
    // If not found in WebApp, check URL query params directly
    if (!token && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
    }
    
    if (token) {
      router.push(`/booking?token=${token}`);
    }
  }, [router]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to the RoadTo150M Booking Schedule</h1>
      <p className="text-xl text-gray-600 mb-8">
        This application helps you easily schedule meetings and appointments.
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <ol className="text-left space-y-4 mb-6">
          <li className="flex gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white">1</span>
            <span>Access the application through a Telegram bot invitation</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white">2</span>
            <span>Select an available date from the calendar</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white">3</span>
            <span>Choose a time slot that works for you</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white">4</span>
            <span>Fill in your information and confirm the booking</span>
          </li>
        </ol>
        
        <p className="italic text-gray-500 text-sm">
          Note: This application is designed to be accessed through a Telegram bot. If you're seeing this page directly, please contact the administrator for a proper booking link.
        </p>
      </div>
      
      <Link href="/booking" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-colors">
        Try Demo Booking
      </Link>
    </div>
  );
}
