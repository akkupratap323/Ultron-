"use client";

import { Loader2, Bot, X, Sparkles, Video } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useCallback } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "@/hooks/useInitializeChatClient";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useVideoClient } from "@/hooks/useVideoClient";
import { VideoCallUI } from "@/components/VideoCallUI";
import IncomingCallModal from "@/components/IncomingCallModal";

// Stream Video SDK imports
import {
  StreamVideo,
  StreamCall,
  Call,
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
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    onTypingChange(true);

    try {
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: `I understand you said: "${userMessage.text}". How can I help you further?`,
          isUser: false
        };
        setMessages(prev => [...prev, aiResponse]);
        onTypingChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating AI response:", error);
      onTypingChange(false);
    }
  }, [inputValue, onTypingChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className={cn(
      "h-full bg-background border-l border-border flex flex-col",
      isMobile && "border-l-0"
    )}>
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Assistant Ready</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask me anything about your conversations.</p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setInputValue("Summarize my recent conversations")}
                className="block w-full text-left p-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                📝 Summarize conversations
              </button>
              <button
                onClick={() => setInputValue("Help me write a professional message")}
                className="block w-full text-left p-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✍️ Write professional message
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm",
                  message.isUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bot className="h-4 w-4 text-blue-500" />
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI anything..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isTyping}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4"
          >
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Chat(): JSX.Element {
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();
  
  // ✅ Fixed: Only destructure properties that exist in useVideoClient
  const { videoClient, isLoading: videoClientLoading, isConnected, error } = useVideoClient(
    chatClient?.user ? {
      id: chatClient.user.id,
      name: chatClient.user.name || chatClient.user.id,
      image: typeof chatClient.user.image === 'string' ? chatClient.user.image : undefined,
    } : undefined
  );

  // ✅ All other hooks in consistent order
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [aiPanelOpen, setAIPanelOpen] = useState<boolean>(false);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [videoCallActive, setVideoCallActive] = useState<boolean>(false);
  const [call, setCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);

  // Debounce utility function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }, []);

  // Mobile detection with better performance
  useEffect(() => {
    const checkMobile = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && aiPanelOpen) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    const debouncedResize = debounce(checkMobile, 150);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [aiPanelOpen, debounce]);

  // ✅ NOW SAFE TO DEFINE USER AFTER ALL HOOKS
  const user = chatClient?.user ? {
    id: chatClient.user.id,
    name: chatClient.user.name || chatClient.user.id,
    image: typeof chatClient.user.image === 'string' ? chatClient.user.image : undefined,
  } : undefined;

  // Accept incoming call handler with better error handling
  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      setCall(incomingCall);
      setVideoCallActive(true);
      await incomingCall.join();
      console.log("✅ Successfully joined incoming call");
    } catch (error) {
      console.error("❌ Error joining incoming call:", error);
      setCall(null);
      setVideoCallActive(false);
    }
  }, [incomingCall]);

  // Reject incoming call handler with better error handling
  const handleRejectCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      await incomingCall.reject();
      console.log("✅ Successfully rejected incoming call");
    } catch (error) {
      console.error("❌ Error rejecting call:", error);
    } finally {
      setCall(null);
      setIncomingCall(null);
    }
  }, [incomingCall]);

  // Start new video call with improved error handling
  const startVideoCall = useCallback(async (targetUserId?: string | Event) => {
    if (!videoClient || !user) {
      console.warn("⚠️ Video client or user not available");
      return;
    }

    const isEvent = targetUserId && typeof targetUserId === 'object' && 'target' in targetUserId;
    if (isEvent) {
      console.log("🔍 Event detected, ignoring for video call");
      return;
    }

    try {
      const callId = `call-${user.id}-${Date.now()}`;
      const newCall = videoClient.call('default', callId);
      
      await newCall.getOrCreate({
        data: {
          custom: {
            title: `Video call with ${user.name}`,
            description: "Video call session"
          }
        }
      });
      
      setCall(newCall);
      setVideoCallActive(true);
      await newCall.join();
      console.log("✅ Video call started successfully");
    } catch (error) {
      console.error("❌ Error starting video call:", error);
      setCall(null);
      setVideoCallActive(false);
    }
  }, [videoClient, user]);

  // End video call handler with improved cleanup
  const endVideoCall = useCallback(async () => {
    if (!call) {
      setVideoCallActive(false);
      return;
    }

    try {
      const callState = call.state?.callingState;
      console.log("🔍 Call state before leaving:", callState);

      if (callState === 'joined' || callState === 'joining') {
        console.log("📞 Leaving call...");
        await call.leave();
      } else {
        console.log("⚠️ Call already left or not joined, skipping leave");
      }
    } catch (error: any) {
      if (error.message?.includes('already been left')) {
        console.log("ℹ️ Call was already left");
      } else {
        console.error("❌ Error leaving call:", error);
      }
    } finally {
      setCall(null);
      setVideoCallActive(false);
    }
  }, [call]);

  // Toggle AI panel with better state management
  const toggleAIPanel = useCallback(() => {
    setAIPanelOpen(prev => {
      const newState = !prev;
      if (isMobile && newState) {
        setSidebarOpen(false);
      }
      return newState;
    });
  }, [isMobile]);

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!chatClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Initializing Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Setting up your messaging experience...
            </p>
            {videoClientLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Video className="h-4 w-4" />
                <span>Preparing video calls...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main chat UI with improved structure
  return (
    <TooltipProvider>
      <main className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Mobile header with better styling */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 backdrop-blur-sm z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              disabled={aiPanelOpen}
              className="text-gray-700 dark:text-gray-300"
            >
              <span className="text-sm font-medium">Chats</span>
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {aiPanelOpen ? "AI Assistant" : "Messages"}
            </h1>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAIPanel}
                    className={cn(
                      "transition-colors",
                      aiPanelOpen 
                        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" 
                        : "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    )}
                  >
                    {aiPanelOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        <div className={cn(
          "absolute bottom-0 top-0 flex w-full",
          isMobile && "top-[73px]"
        )}>
          <StreamChat
            client={chatClient}
            theme={
              resolvedTheme === "dark"
                ? "str-chat__theme-dark"
                : "str-chat__theme-light"
            }
          >
            <ChatSidebar 
              open={sidebarOpen && !aiPanelOpen}
              onClose={() => setSidebarOpen(false)}
              currentUser={user}
            />
            <ChatChannel 
              open={!sidebarOpen || aiPanelOpen}
              openSidebar={() => setSidebarOpen(true)}
              currentUser={user}
              onStartVideoCall={startVideoCall}
              onToggleAI={toggleAIPanel}
            />
          </StreamChat>

          {/* AI Panel - Desktop with better styling */}
          {aiPanelOpen && !isMobile && (
            <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
              <AIAssistantPanel 
                onClose={() => setAIPanelOpen(false)}
                isTyping={isAITyping}
                onTypingChange={setIsAITyping}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>

        {/* AI Panel - Mobile Overlay with better animation */}
        {aiPanelOpen && isMobile && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 z-40 animate-in slide-in-from-right duration-300">
            <AIAssistantPanel 
              onClose={() => setAIPanelOpen(false)}
              isTyping={isAITyping}
              onTypingChange={setIsAITyping}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Incoming call modal with better positioning */}
        {incomingCall && !videoCallActive && (
          <div className="absolute inset-0 z-50">
            <IncomingCallModal
              call={incomingCall}
              onAccept={handleAcceptCall}
              onReject={handleRejectCall}
            />
          </div>
        )}

        {/* Video call UI with better fullscreen handling */}
        {videoCallActive && videoClient && call && (
          <div className="absolute inset-0 z-50 bg-black">
            <StreamVideo client={videoClient}>
              <StreamCall call={call}>
                <VideoCallUI onLeave={endVideoCall} />
              </StreamCall>
            </StreamVideo>
          </div>
        )}

        {/* Desktop AI Toggle Button with enhanced styling */}
        {!isMobile && !aiPanelOpen && (
          <div className="absolute bottom-6 right-6 z-30">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-12 px-6"
                  onClick={toggleAIPanel}
                >
                  <Bot className="h-5 w-5 mr-2" />
                  <span className="font-medium">AI Assistant</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Open AI Assistant
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </main>
    </TooltipProvider>
  );
}
