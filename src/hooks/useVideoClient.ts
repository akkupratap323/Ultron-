import { useEffect, useState } from 'react';
import { StreamVideoClient, User } from '@stream-io/video-react-sdk';

export const useVideoClient = (user: User | undefined) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.warn("User or user.id is missing in useVideoClient");
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      try {
        const client = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
          user,
          tokenProvider: async () => {
            console.log("Requesting video token for user:", user.id);
            
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
      if (videoClient) {
        videoClient.disconnectUser();
        setVideoClient(undefined);
      }
    };
  }, [user?.id, videoClient]); // Fixed: Added missing dependencies

  return { videoClient, isLoading };
};
