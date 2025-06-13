import { useEffect, useState, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { useSession } from '@/app/(main)/SessionProvider';

const useInitializeChatClient = () => {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const clientRef = useRef<StreamChat | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttempts = useRef(0);

  useEffect(() => {
    // Don't initialize if already connecting or no user
    if (!user?.id || isConnecting) return;
    // Don't create multiple clients
    if (clientRef.current) return;

    const initializeClient = async (retryCount = 0) => {
      if (retryCount === 0) {
        setIsConnecting(true);
        connectionAttempts.current = 0;
      }
      try {
        if (!clientRef.current) {
          clientRef.current = StreamChat.getInstance(
            process.env.NEXT_PUBLIC_STREAM_API_KEY!,
            {
              timeout: 10000,
              baseURL: 'https://chat.stream-io-api.com',
            }
          );
        }
        const client = clientRef.current;
        if (client.wsConnection?.isConnecting || client.wsConnection?.isHealthy) {
          setChatClient(client);
          setIsConnecting(false);
          return;
        }
        const tokenProvider = async () => {
          try {
            const response = await fetch('/api/get-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After');
              const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
              await new Promise((resolve) => setTimeout(resolve, delay));
              throw new Error('Rate limited - retry needed');
            }
            if (!response.ok) {
              throw new Error(`Token API failed: ${response.status}`);
            }
            const data = await response.json();
            return data.token;
          } catch (error) {
            throw error;
          }
        };
        await client.connectUser(
          {
            id: user.id,
            name: user.displayName || user.id,
            image: user.avatarUrl,
          },
          tokenProvider
        );
        setChatClient(client);
        setIsConnecting(false);
        connectionAttempts.current = 0;
      } catch (error: any) {
        setIsConnecting(false);
        connectionAttempts.current += 1;
        const retryDelay = Math.min(5000 * connectionAttempts.current, 30000);
        console.warn(`Connection attempt ${connectionAttempts.current} failed, retrying in ${retryDelay}ms...`, error);
        retryTimeoutRef.current = setTimeout(() => {
          initializeClient(connectionAttempts.current);
        }, retryDelay);
      }
    };
    initializeClient();
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (clientRef.current) {
        try {
          clientRef.current.disconnectUser();
        } catch (error) {}
        clientRef.current = null;
      }
      setChatClient(null);
      setIsConnecting(false);
    };
  }, [user?.id]);
  return chatClient;
};

export default useInitializeChatClient;
