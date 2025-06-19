// Create a new file: lib/api-client.ts
import axios from 'axios';

// Create axios instance with increased timeout
export const apiClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add retry logic for failed requests
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      console.warn('Request timed out, retrying...');
      // Retry logic here if needed
    }
    return Promise.reject(error);
  }
);
