// Type definitions for Telegram Web App SDK
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          start_param: string;
        };
        sendData: (data: string) => void;
        expand: () => void;
        MainButton: {
          text: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

// Initialize Telegram Web App
export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
};

// Get user information from Telegram
export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && window.Telegram) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
};

// Get token from Telegram start parameter or URL query
export const getBookingToken = () => {
  let token = null;
  
  // First try to get from Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram) {
    token = window.Telegram.WebApp.initDataUnsafe.start_param;
    if (token) return token;
  }
  
  // Then try URL query parameter
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
  }
  
  return token;
};

// Show Telegram main button
export const showMainButton = (text: string, callback: () => void) => {
  if (typeof window !== 'undefined' && window.Telegram) {
    const { MainButton } = window.Telegram.WebApp;
    MainButton.text = text;
    MainButton.onClick(callback);
    MainButton.show();
  }
};

// Hide Telegram main button
export const hideMainButton = () => {
  if (typeof window !== 'undefined' && window.Telegram) {
    window.Telegram.WebApp.MainButton.hide();
  }
};

// Send data back to Telegram bot
export const sendDataToTelegram = (data: any) => {
  if (typeof window !== 'undefined' && window.Telegram) {
    window.Telegram.WebApp.sendData(JSON.stringify(data));
  }
};

// Close the Web App
export const closeWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram) {
    window.Telegram.WebApp.close();
  }
}; 