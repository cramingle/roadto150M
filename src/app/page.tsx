'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBookingToken, initTelegramWebApp } from '@/lib/telegram';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Initialize Telegram web app and check for token
  useEffect(() => {
    initTelegramWebApp();
    
    // First try to get token from Telegram WebApp
    let token = getBookingToken();
    
    // If not found in WebApp, check URL query params directly
    if (!token && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      token = urlParams.get('token');
    }
    
    if (token) {
      router.push(`/booking?token=${token}`);
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
