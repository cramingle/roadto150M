import React from 'react';

interface ConfirmationViewProps {
  bookingId: string | null;
}

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ bookingId }) => {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-6">
        Your meeting has been successfully scheduled.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <p className="text-blue-700">
          You'll receive a notification in Telegram before your scheduled meeting.
        </p>
      </div>
      
      <p className="text-sm text-gray-500">
        Booking Reference: {bookingId || 'N/A'}
      </p>
      
      <p className="mt-6 text-gray-500">
        This window will close automatically in a few seconds...
      </p>
    </div>
  );
}; 