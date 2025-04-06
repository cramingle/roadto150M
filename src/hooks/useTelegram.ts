import { useEffect, useState } from 'react';
import { 
  initTelegramWebApp,
  getTelegramUser,
  getBookingToken,
  showMainButton,
  hideMainButton,
  closeWebApp
} from '@/lib/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export const useTelegram = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Initialize Telegram Web App
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Telegram Web App
      initTelegramWebApp();
      
      // Get user data
      const telegramUser = getTelegramUser();
      if (telegramUser) {
        setUser(telegramUser);
      }
      
      // Get token
      const bookingToken = getBookingToken();
      if (bookingToken) {
        setToken(bookingToken);
      }
      
      setIsReady(true);
    }
  }, []);
  
  // Function to show main button
  const showButton = (text: string, callback: () => void) => {
    showMainButton(text, callback);
  };
  
  // Function to hide main button
  const hideButton = () => {
    hideMainButton();
  };
  
  // Function to close web app
  const close = () => {
    closeWebApp();
  };
  
  return {
    isReady,
    user,
    token,
    showButton,
    hideButton,
    close
  };
}; 