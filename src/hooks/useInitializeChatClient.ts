import { useEffect, useState, useRef } from 'react';
import { StreamChat } from 'stream-chat';

const useInitializeChatClient = () => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<StreamChat | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to get user:', error);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user?.id || isConnecting) return;
    if (clientRef.current) return; // Prevent multiple clients

    const initializeClient = async (retryCount = 0) => {
      if (retryCount === 0) setIsConnecting(true);

      try {
        console.log(`🔄 Initializing Stream Chat (attempt ${retryCount + 1})`);
        
        // Create client instance only once
        if (!clientRef.current) {
          clientRef.current = StreamChat.getInstance(
            process.env.NEXT_PUBLIC_STREAM_API_KEY!,
            { 
              timeout: 15000,
              baseURL: 'https://chat.stream-io-api.com'
            }
          );
        }

        const client = clientRef.current;

        // Check if already connected
        if (client.wsConnection?.isHealthy) {
          console.log("✅ Already connected to Stream Chat");
          setChatClient(client);
          setIsConnecting(false);
          return;
        }

        // Enhanced token provider with retry logic
        const tokenProvider = async () => {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              console.log(`🔑 Requesting token (attempt ${attempt + 1})`);
              const response = await fetch('/api/get-token', {
                method: 'GET',
                headers: { 
                  'Cache-Control': 'no-cache',
                  'Content-Type': 'application/json'
                }
              });

              if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
                console.log(`⏳ Token API rate limited, waiting ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Token API failed: ${response.status} - ${errorText}`);
              }

              const data = await response.json();
              console.log("✅ Token received successfully");
              return data.token;
            } catch (error) {
              console.error(`❌ Token attempt ${attempt + 1} failed:`, error);
              if (attempt === 2) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
          }
        };

        // Connect with user data
        await client.connectUser(
          {
            id: user.id,
            name: user.displayName || user.username || user.id,
            image: user.avatarUrl,
          },
          tokenProvider
        );

        console.log("✅ Stream Chat connected successfully");
        setChatClient(client);
        setIsConnecting(false);

      } catch (error: any) {
        console.error("❌ Stream Chat connection error:", error);
        
        // Handle rate limit errors with exponential backoff
        if (error.code === 9 || error.message?.includes('429') || error.message?.includes('Too many requests')) {
          if (retryCount < 4) {
            const delay = Math.pow(2, retryCount) * 3000 + Math.random() * 1000; // 3s, 6s, 12s, 24s + jitter
            console.log(`🔄 Rate limited, retrying in ${Math.round(delay)}ms`);
            
            retryTimeoutRef.current = setTimeout(() => {
              initializeClient(retryCount + 1);
            }, delay);
            return;
          } else {
            console.error("❌ Max retry attempts reached");
          }
        }
        
        setIsConnecting(false);
      }
    };

    initializeClient();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (clientRef.current && clientRef.current.wsConnection?.isHealthy) {
        try {
          clientRef.current.disconnectUser();
        } catch (error) {
          console.warn("Error disconnecting:", error);
        }
      }
      
      clientRef.current = null;
      setChatClient(null);
      setIsConnecting(false);
    };
  }, [user?.id]);

  return chatClient;
};

export default useInitializeChatClient;
