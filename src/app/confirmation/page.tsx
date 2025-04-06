'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { closeWebApp } from '@/lib/telegram';
import { ConfirmationView } from '@/components/booking/ConfirmationView';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  
  useEffect(() => {
    // Set a timer to close the web app after showing confirmation
    const timer = setTimeout(() => {
      closeWebApp();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <ConfirmationView bookingId={bookingId} />
    </div>
  );
} 