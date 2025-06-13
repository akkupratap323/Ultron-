"use client";

import { Loader2, Bot, X, Sparkles, Video } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "@/hooks/useInitializeChatClient";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useVideoClient } from "@/hooks/useVideoClient";
import { VideoCallUI } from "@/components/VideoCallUI";

// Stream Video SDK imports
import {
  StreamVideo,
  StreamCall,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

// AI Assistant Panel
interface AIAssistantPanelProps {
  onClose: () => void;
  isTyping: boolean;
  onTypingChange: (typing: boolean) => void;
  isMobile: boolean;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  onClose,
  isTyping,
  onTypingChange,
  isMobile
}) => {
  // Your existing AI panel implementation
  return (
    <div className="h-full bg-background border-l border-border flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">AI Assistant</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4">
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        )}
        {/* Your AI chat implementation */}
      </div>
    </div>
  );
};

export default function Chat(): JSX.Element {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  // Connection state management
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const connectionAttemptRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get user data from chat client
  const user = chatClient?.user ? {
    id: chatClient.user.id,
    name: chatClient.user.name || chatClient.user.id,
    image: typeof chatClient.user.image === 'string' ? chatClient.user.image : undefined,
  } : undefined;

  const { videoClient, isLoading: videoClientLoading } = useVideoClient(user);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [aiPanelOpen, setAIPanelOpen] = useState<boolean>(false);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [videoCallActive, setVideoCallActive] = useState<boolean>(false);
  const [call, setCall] = useState<any>(null);

  useEffect(() => {
    const checkMobile = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile && aiPanelOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [aiPanelOpen]);

  // Enhanced connection management
  useEffect(() => {
    if (!chatClient || !user?.id) {
      setConnectionState('disconnected');
      return;
    }
    
    if (connectionState === 'connecting' || connectionAttemptRef.current) return;

    const handleConnection = async (retryCount = 0) => {
      if (connectionAttemptRef.current) return;
      
      connectionAttemptRef.current = true;
      setConnectionState('connecting');

      try {
        // Check if already connected
        if (chatClient.wsConnection?.isConnecting || chatClient.wsConnection?.isHealthy) {
          console.log("Stream Chat already connected or connecting");
          setConnectionState('connected');
          connectionAttemptRef.current = false;
          return;
        }

        // Monitor connection state
        const connectionPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout'));
          }, 15000);

          const handleConnectionChanged = (event: any) => {
            if (event.online) {
              clearTimeout(timeout);
              chatClient.off('connection.changed', handleConnectionChanged);
              resolve(event);
            }
          };

          const handleConnectionError = (error: any) => {
            clearTimeout(timeout);
            chatClient.off('connection.changed', handleConnectionChanged);
            chatClient.off('connection.error', handleConnectionError);
            reject(error);
          };

          chatClient.on('connection.changed', handleConnectionChanged);
          chatClient.on('connection.error', handleConnectionError);
        });

        await connectionPromise;
        setConnectionState('connected');
        console.log("✅ Stream Chat connected successfully");

      } catch (error: any) {
        console.error("❌ Stream Chat connection error:", error);
        
        // Handle rate limit (429) errors with exponential backoff
        if (error.code === 9 || (error.message && error.message.includes('429'))) {
          if (retryCount < 3) {
            const backoffDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
            console.log(`🔄 Rate limited, retrying in ${backoffDelay}ms (attempt ${retryCount + 1}/3)`);
            
            retryTimeoutRef.current = setTimeout(() => {
              connectionAttemptRef.current = false;
              handleConnection(retryCount + 1);
            }, backoffDelay);
            
            return;
          } else {
            console.error("❌ Max retry attempts reached for rate limit");
          }
        }
        
        setConnectionState('disconnected');
      } finally {
        if (retryCount === 0) {
          connectionAttemptRef.current = false;
        }
      }
    };

    handleConnection();

    // Cleanup function
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      connectionAttemptRef.current = false;
    };
  }, [chatClient, user?.id, connectionState]);

  const startVideoCall = async () => {
    if (!videoClient || !user?.id) {
      console.error("❌ Video client or user not ready");
      return;
    }

    try {
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("🎥 Starting video call with ID:", callId);
      
      const newCall = videoClient.call('default', callId);
      await newCall.join({ create: true });
      
      setCall(newCall);
      setVideoCallActive(true);
      setAIPanelOpen(false);
      setSidebarOpen(false);
      
      console.log("✅ Video call started successfully");
    } catch (error) {
      console.error("❌ Error starting video call:", error);
    }
  };

  const endVideoCall = async () => {
    if (call) {
      try {
        await call.leave();
        console.log("✅ Left video call successfully");
      } catch (error) {
        console.error("❌ Error leaving call:", error);
      }
      setCall(null);
    }
    setVideoCallActive(false);
  };

  // Enhanced loading conditions with connection state
  if (!chatClient || !user?.id || connectionState !== 'connected' || videoClientLoading || !videoClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="text-lg">Loading chat and video features...</span>
        <span className="text-sm text-muted-foreground mt-2">
          {!chatClient ? "Initializing chat..." : 
           !user?.id ? "Loading user..." :
           connectionState === 'connecting' ? "Connecting to chat..." :
           connectionState === 'disconnected' ? "Reconnecting..." :
           videoClientLoading ? "Setting up video..." : 
           "Almost ready..."}
        </span>
      </div>
    );
  }

  // Render video call UI when active
  if (videoCallActive && videoClient && call) {
    return (
      <TooltipProvider>
        <main className="relative w-full h-full overflow-hidden rounded-2xl bg-card shadow-sm">
          <StreamVideo client={videoClient}>
            <StreamCall call={call}>
              <VideoCallUI onLeave={endVideoCall} />
            </StreamCall>
          </StreamVideo>
        </main>
      </TooltipProvider>
    );
  }

  // Render main chat UI
  return (
    <TooltipProvider>
      <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between p-3 border-b border-border bg-background/90 backdrop-blur-sm z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              disabled={aiPanelOpen}
            >
              <span className="text-sm">Chats</span>
            </Button>
            <h1 className="text-lg font-semibold">
              {aiPanelOpen ? "AI Assistant" : "Messages"}
            </h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={startVideoCall}
                disabled={!videoClient}
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAIPanelOpen(!aiPanelOpen)}
              >
                {aiPanelOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}

        <div className={cn(
          "absolute bottom-0 top-0 flex w-full",
          isMobile && "top-[60px]"
        )}>
          <StreamChat
            client={chatClient}
            theme={
              resolvedTheme === "dark"
                ? "str-chat__theme-dark"
                : "str-chat__theme-light"
            }
          >
            {(!isMobile || !aiPanelOpen) && (
              <ChatSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            )}

            {(!isMobile || !aiPanelOpen) && (
              <ChatChannel
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
              />
            )}

            {aiPanelOpen && (
              <div className={cn(
                "flex-shrink-0",
                isMobile ? "w-full" : "w-80"
              )}>
                <AIAssistantPanel 
                  onClose={() => setAIPanelOpen(false)}
                  isTyping={isAITyping}
                  onTypingChange={setIsAITyping}
                  isMobile={isMobile}
                />
              </div>
            )}
          </StreamChat>
        </div>

        {/* Desktop floating buttons */}
        {!isMobile && (
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={startVideoCall}
                  disabled={!videoClient}
                  className="h-12 w-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600 transition-all duration-300 hover:scale-110"
                  size="icon"
                >
                  <Video className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start Video Call</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setAIPanelOpen(!aiPanelOpen)}
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
                    aiPanelOpen 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-purple-500 hover:bg-purple-600"
                  )}
                  size="icon"
                >
                  {aiPanelOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <div className="relative">
                      <Bot className="h-5 w-5" />
                      {isAITyping && (
                        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
                      )}
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{aiPanelOpen ? "Close" : "Open"} AI Assistant</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </main>
    </TooltipProvider>
  );
}
