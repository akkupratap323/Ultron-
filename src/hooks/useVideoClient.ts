import { useEffect, useState, useRef } from 'react';
import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

export const useVideoClient = (user: User | undefined) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const clientRef = useRef<StreamVideoClient | undefined>();

  useEffect(() => {
    // Wait for user to be available
    if (!user?.id) {
      console.log("❌ User or user.id is missing in useVideoClient");
      return;
    }

    // Don't create multiple clients for the same user
    if (clientRef.current) {
      console.log("✅ Video client already exists for user:", user.id);
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      try {
        console.log("🎥 Initializing video client for user:", user.id);
        
        // Use getOrCreateInstance to prevent duplicate clients
        const client = StreamVideoClient.getOrCreateInstance({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user,
          tokenProvider: async () => {
            console.log("🔑 Requesting video token for user:", user.id);
            
            const response = await fetch('/api/video-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error("❌ Video token API failed:", response.status, errorText);
              throw new Error(`Video token API failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("✅ Video token received successfully");
            return data.token;
          },
        });

        clientRef.current = client;
        setVideoClient(client);
        console.log("✅ Video client initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize video client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();

    return () => {
      // Only disconnect if this hook instance created the client
      if (clientRef.current) {
        console.log("🧹 Cleaning up video client");
        try {
          clientRef.current.disconnectUser();
        } catch (error) {
          console.warn("Error disconnecting video client:", error);
        }
        clientRef.current = undefined;
        setVideoClient(undefined);
      }
    };
  }, [user?.id]); // Only depend on user.id to prevent unnecessary re-runs

  return { videoClient, isLoading };
};
