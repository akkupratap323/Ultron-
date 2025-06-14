"use-client";

import { useEffect, useState } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';

export const useVideoClient = (user: any) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setVideoClient(undefined);
      setIsConnected(false);
      setError("No user ID available");
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY;
        if (!apiKey) {
          throw new Error('Missing API key');
        }

        const tokenProvider = async () => {
          const response = await fetch('/api/video-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });

          if (!response.ok) {
            throw new Error(`Token failed: ${response.status}`);
          }

          const data = await response.json();
          return data.token;
        };

        // Create client - this is enough!
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: {
            id: user.id,
            name: user.name || user.id,
          },
          tokenProvider,
        });

        // Don't wait for connection - just set the client
        setVideoClient(client);
        setIsConnected(true);
        console.log("✅ Video client created successfully");
        
      } catch (error: any) {
        console.error("❌ Video client failed:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, [user?.id]);

  return { videoClient, isLoading, isConnected, error };
};
