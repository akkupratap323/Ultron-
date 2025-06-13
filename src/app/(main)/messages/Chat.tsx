"use client";

import { Loader2, Bot, X, Sparkles, Video, PhoneOff } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";
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

// AI Assistant Panel (keeping your existing implementation)
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
      {/* Your existing AI panel JSX */}
    </div>
  );
};

export default function Chat(): JSX.Element {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

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

  // Show loader while clients are initializing
  if (!chatClient || !user?.id || videoClientLoading || !videoClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <span className="text-lg">Loading chat and video features...</span>
        <span className="text-sm text-muted-foreground mt-2">
          {!chatClient ? "Initializing chat..." : 
           !user?.id ? "Loading user..." :
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
