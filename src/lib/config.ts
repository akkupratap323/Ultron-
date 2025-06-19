// lib/config.ts
const getTimeoutConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    return {
      timeout: 20000, // 20 seconds for development
      retryCount: 2,
      retryDelay: 2000
    };
  }
  
  if (isProduction) {
    return {
      timeout: 15000, // 15 seconds for production
      retryCount: 3,
      retryDelay: 1500
    };
  }
  
  return {
    timeout: 12000, // Default 12 seconds
    retryCount: 2,
    retryDelay: 1000
  };
};

export const ZEGO_CONFIG = getTimeoutConfig();
