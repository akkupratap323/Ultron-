"use client";

import { Loader2, Bot, X, Menu, PhoneOff } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import AIAssistantPanel from "@/components/AIAssistantPanel"; // Import the separate component
import useInitializeChatClient from "@/hooks/useInitializeChatClient";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useRouter, useSearchParams } from 'next/navigation';

// ZEGOCLOUD Video Call Component with Enhanced Error Handling
interface ZEGOCLOUDProps {
  roomID: string;
  userID: string;
  userName: string;
  onCallEnd?: () => void;
  isInviteJoin?: boolean;
  showInviteButton?: boolean;
}

// Enhanced URL parameter parsing with SSR safety
function getUrlParams(url?: string) {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  
  try {
    const targetUrl = url || window.location.href;
    const urlObj = new URL(targetUrl);
    return urlObj.searchParams;
  } catch (error) {
    const urlStr = (url || window.location.href).split('?')[1];
    if (!urlStr) return new URLSearchParams();
    return new URLSearchParams(urlStr);
  }
}

// Generate random ID function for ZEGOCLOUD
function randomID(len: number = 5): string {
  let result = '';
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  const maxPos = chars.length;
  
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

// Monkey patch for removeChild to prevent crashes - Fixed TypeScript declaration
const patchRemoveChild = () => {
  if (typeof window === 'undefined') return;
  
  // Type-safe monkey patch
  const originalRemoveChild = Node.prototype.removeChild;
  
  // Override with proper typing
  (Node.prototype as any).removeChild = function(child: Node): Node {
    try {
      // Check if the child is actually a child of this node
      if (this.contains && this.contains(child)) {
        return originalRemoveChild.call(this, child);
      } else if (child.parentNode === this) {
        return originalRemoveChild.call(this, child);
      } else {
        console.warn('Prevented removeChild error: node is not a child of this parent');
        return child;
      }
    } catch (err) {
      if (err instanceof Error && /not a child of this node/.test(err.message)) {
        console.warn('Caught and ignored removeChild error:', err.message);
        return child;
      }
      throw err;
    }
  };
};

const ZEGOCLOUD: React.FC<ZEGOCLOUDProps> = ({ 
  roomID, 
  userID, 
  userName, 
  onCallEnd,
  isInviteJoin = false,
  showInviteButton = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null);
  const isDestroyingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  const [isClient, setIsClient] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");

  // Apply monkey patch on component mount
  useEffect(() => {
    patchRemoveChild();
  }, []);

  // Ensure component only initializes on client-side
  useEffect(() => {
    setIsClient(true);
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Generate shareable link only on client side
  useEffect(() => {
    if (!isClient || !roomID) return;
    
    const finalRoomID = isInviteJoin ? roomID : `${roomID}_${Date.now()}`;
    const shareableLink = `${window.location.origin}/messages?roomID=${finalRoomID}&action=join&userName=${encodeURIComponent(userName)}`;
    setInviteLink(shareableLink);
  }, [isClient, roomID, userName, isInviteJoin]);

  // Enhanced safe destroy function with comprehensive DOM checks
  const safeDestroy = useCallback(async () => {
    if (isDestroyingRef.current || !zegoInstanceRef.current || !isMountedRef.current) {
      return;
    }
    
    try {
      isDestroyingRef.current = true;
      console.log('🧹 Destroying ZEGO instance...');
      
      const container = containerRef.current;
      const zegoInstance = zegoInstanceRef.current;
      
      if (!container) {
        console.warn('Container ref is null during cleanup');
        zegoInstanceRef.current = null;
        return;
      }

      if (!document.contains(container)) {
        console.warn('Container is no longer in the DOM during cleanup');
        zegoInstanceRef.current = null;
        return;
      }

      if (!container.parentNode) {
        console.warn('Container has no parent node during cleanup');
        zegoInstanceRef.current = null;
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isMountedRef.current || !containerRef.current) {
        console.warn('Component unmounted during cleanup delay');
        zegoInstanceRef.current = null;
        return;
      }

      await zegoInstance.destroy();
      zegoInstanceRef.current = null;
      console.log('✅ ZEGO instance destroyed successfully');
      
    } catch (error) {
      console.warn('⚠️ Warning during ZEGO instance destruction:', error);
      zegoInstanceRef.current = null;
    } finally {
      isDestroyingRef.current = false;
    }
  }, []);

  // Enhanced safe cleanup function
  const safeCleanup = useCallback(() => {
    console.log('🧽 Starting safe cleanup...');
    if (!isDestroyingRef.current && isMountedRef.current) {
      safeDestroy();
    }
    setIsJoining(false);
    setConnectionError(null);
    hasInitializedRef.current = false;
    console.log('✅ Safe cleanup completed');
  }, [safeDestroy]);

  useEffect(() => {
    if (!isClient || isJoining || !roomID || !userID || hasInitializedRef.current || !isMountedRef.current) return;

    const initializeCall = async () => {
      if (!containerRef.current || isDestroyingRef.current || !isMountedRef.current) return;

      try {
        hasInitializedRef.current = true;
        setIsJoining(true);
        setConnectionError(null);

        console.log('🚀 Initializing ZEGOCLOUD call...', {
          roomID,
          userID,
          userName,
          isInviteJoin,
          timestamp: new Date().toISOString()
        });

        await safeDestroy();

        if (!isMountedRef.current || !containerRef.current) {
          console.warn('Component unmounted during initialization');
          return;
        }

        const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!, 10);
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
        
        if (!appID || !serverSecret) {
          throw new Error('ZEGOCLOUD credentials not found');
        }

        const finalRoomID = isInviteJoin ? roomID : `${roomID}_${Date.now()}`;
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          finalRoomID,
          userID,
          userName || `User_${userID}`
        );

        if (!isMountedRef.current || !containerRef.current) {
          console.warn('Component unmounted before ZEGO instance creation');
          return;
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;

        await zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Invite Others to Join',
              url: inviteLink,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 10,
          layout: "Auto",
          showLayoutButton: false,
          onJoinRoom: () => {
            if (!isMountedRef.current) return;
            console.log('✅ Successfully joined ZEGO room:', finalRoomID);
            setIsJoining(false);
            setConnectionError(null);
          },
          onLeaveRoom: () => {
            if (!isMountedRef.current) return;
            console.log('📞 Left ZEGO room');
            safeCleanup();
            if (onCallEnd) onCallEnd();
          },
          onUserJoin: (users: any[]) => {
            console.log('👥 Users joined:', users);
          },
          onUserLeave: (users: any[]) => {
            console.log('👋 Users left:', users);
          },
        });

      } catch (error: any) {
        console.error('❌ Error initializing ZEGOCLOUD:', error);
        setConnectionError(error.message || 'Failed to initialize video call');
        setIsJoining(false);
        hasInitializedRef.current = false;
        if (onCallEnd) onCallEnd();
      }
    };

    initializeCall();

    return () => {
      console.log('🔄 Component unmounting, cleaning up...');
      isMountedRef.current = false;
      safeCleanup();
    };
  }, [isClient, roomID, userID, userName, isInviteJoin, inviteLink, safeDestroy, safeCleanup, onCallEnd]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-lg font-medium">Initializing video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-wrapper h-full">
      <div
        className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative shadow-2xl border border-slate-700"
        ref={containerRef}
        style={{ minHeight: '400px' }}
      >
        {isJoining && (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center space-y-6 p-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-xl font-semibold">Connecting to video call...</p>
                <p className="text-sm text-slate-300">
                  {isInviteJoin ? 'Joining via invite link...' : 'Starting new call...'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {connectionError && (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
              <p className="text-red-400 mb-6">{connectionError}</p>
              <Button 
                onClick={() => {
                  setConnectionError(null);
                  hasInitializedRef.current = false;
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Retry Connection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Custom hook for debouncing to prevent rapid state changes
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Main Chat Component with Enhanced UI
export default function Chat(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  // User definition
  const user = chatClient?.user ? {
    id: chatClient.user.id,
    name: chatClient.user.name || chatClient.user.id,
    image: typeof chatClient.user.image === 'string' ? chatClient.user.image : undefined,
  } : undefined;

  // State management
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [aiPanelOpen, setAIPanelOpen] = useState<boolean>(false);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [videoCallActive, setVideoCallActive] = useState<boolean>(false);
  const [roomID, setRoomID] = useState<string>("");
  const [isCallInitializing, setIsCallInitializing] = useState(false);
  const [callCleanupTimeout, setCallCleanupTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isInviteJoin, setIsInviteJoin] = useState(false);
  const cleanupInProgressRef = useRef(false);
  const hasProcessedInviteRef = useRef(false);

  // Memoized tooltip content to prevent re-renders
  const aiTooltipContent = useMemo(() => 
    aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant", 
    [aiPanelOpen]
  );

  // Tooltip provider props to prevent re-renders
  const tooltipProviderProps = useMemo(() => ({
    delayDuration: 300,
    skipDelayDuration: 100
  }), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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

  // Enhanced invite link detection using Next.js hooks
  useEffect(() => {
    if (!chatClient?.user || hasProcessedInviteRef.current) return;

    const inviteRoomID = searchParams.get('roomID');
    const joinAction = searchParams.get('action');
    const inviteUserName = searchParams.get('userName');

    // Check for valid invite parameters
    if (inviteRoomID && joinAction === 'join') {
      console.log('✅ Valid invite link detected, processing...');
      if (videoCallActive) {
        console.log('🔄 Ending existing call to join invite...');
        endVideoCall().then(() => {
          setTimeout(() => {
            joinViaInvite(inviteRoomID, inviteUserName);
          }, 2000);
        });
      } else {
        joinViaInvite(inviteRoomID, inviteUserName);
      }
      hasProcessedInviteRef.current = true;
    }
  }, [searchParams, chatClient?.user, videoCallActive]);

  // Function to join via invite
  const joinViaInvite = useCallback((roomID: string, userName?: string | null) => {
    console.log('🎯 Joining via invite:', { roomID, userName });
    setIsInviteJoin(true);
    setRoomID(roomID);
    setVideoCallActive(true);
    if (userName && chatClient?.user) {
      chatClient.user.name = decodeURIComponent(userName);
    }
    router.replace('/messages');
    console.log('🎥 Video call activated from invite link');
  }, [chatClient?.user, router]);

  // Reset the invite processing flag when video call ends
  const endVideoCall = useCallback(async () => {
    if (cleanupInProgressRef.current) {
      console.log('🚫 Cleanup already in progress, skipping');
      return;
    }

    try {
      cleanupInProgressRef.current = true;
      hasProcessedInviteRef.current = false;
      console.log("📞 Ending ZEGOCLOUD call...", { timestamp: new Date().toISOString() });
      
      setVideoCallActive(false);
      setIsCallInitializing(false);
      setIsInviteJoin(false);
      
      const timeout = setTimeout(() => {
        setRoomID("");
        cleanupInProgressRef.current = false;
        console.log("✅ Call cleanup completed");
      }, 3000);
      
      setCallCleanupTimeout(timeout);
      
    } catch (error) {
      console.error("❌ Error ending call:", error);
      cleanupInProgressRef.current = false;
      hasProcessedInviteRef.current = false;
    }
  }, []);

  // Enhanced start video call function with proper guards and try-catch
  const startVideoCall = useCallback(async (targetUserId?: string | Event) => {
    if (!user || isCallInitializing || videoCallActive || cleanupInProgressRef.current) {
      console.log('🚫 Call already in progress, initializing, or cleaning up');
      return;
    }

    try {
      setIsCallInitializing(true);
      console.log('🚀 Starting video call...');
      
      if (callCleanupTimeout) {
        clearTimeout(callCleanupTimeout);
        setCallCleanupTimeout(null);
      }
      
      if (videoCallActive) {
        console.log('🔄 Ending existing call before starting new one...');
        await endVideoCall();
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      const callId = `call-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Generated call ID:', callId);
      
      setRoomID(callId);
      setIsInviteJoin(false);
      setVideoCallActive(true);
      
      console.log("✅ ZEGOCLOUD video call initiated successfully");
    } catch (error) {
      console.error("❌ Error starting video call:", error);
      setVideoCallActive(false);
      setRoomID("");
    } finally {
      setIsCallInitializing(false);
    }
  }, [user, isCallInitializing, videoCallActive, callCleanupTimeout]);

  const toggleAIPanel = useCallback(() => {
    console.log('🤖 Toggling AI panel...', { currentState: aiPanelOpen });
    setAIPanelOpen(!aiPanelOpen);
    if (isMobile && !aiPanelOpen) {
      setSidebarOpen(false);
    }
  }, [aiPanelOpen, isMobile]);

  if (!chatClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <span className="text-xl font-semibold text-slate-900 dark:text-white">Initializing chat...</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">Setting up your secure connection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider {...tooltipProviderProps}>
      <main className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Enhanced Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 backdrop-blur-sm z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              disabled={aiPanelOpen}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">Chats</span>
            </Button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {aiPanelOpen ? "AI Assistant" : "Messages"}
            </h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAIPanel}
                  className={cn(
                    "relative transition-all duration-200 hover:scale-105",
                    aiPanelOpen 
                      ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30" 
                      : "bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-600 dark:from-emerald-900/20 dark:to-green-900/20 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30"
                  )}
                >
                  {aiPanelOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  {!aiPanelOpen && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {aiTooltipContent}
              </TooltipContent>
            </Tooltip>
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

          {/* AI Panel - Desktop */}
          {aiPanelOpen && !isMobile && (
            <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700">
              <AIAssistantPanel 
                onClose={() => setAIPanelOpen(false)}
                isTyping={isAITyping}
                onTypingChange={setIsAITyping}
                isMobile={isMobile}
              />
            </div>
          )}
        </div>

        {/* AI Panel - Mobile Overlay */}
        {aiPanelOpen && isMobile && (
          <div className="absolute inset-0 bg-white dark:bg-slate-900 z-40">
            <AIAssistantPanel 
              onClose={() => setAIPanelOpen(false)}
              isTyping={isAITyping}
              onTypingChange={setIsAITyping}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Enhanced ZEGOCLOUD Video Call UI */}
        {videoCallActive && user && roomID && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-7xl max-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              {/* Enhanced Close Button */}
              <Button
                size="icon"
                onClick={endVideoCall}
                className="absolute top-6 right-6 z-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-lg border border-red-500 transition-all duration-200 hover:scale-110 w-12 h-12"
                title="End Call"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
              
              {/* Call Status Indicator */}
              <div className="absolute top-6 left-6 z-10 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Live Call
              </div>
              
              {/* ZEGOCLOUD Component */}
              <ZEGOCLOUD 
                roomID={roomID}
                userID={user.id}
                userName={user.name}
                onCallEnd={endVideoCall}
                isInviteJoin={isInviteJoin}
                showInviteButton={true}
              />
            </div>
          </div>
        )}

        {/* REMOVED: Green AI Assistant Button - No longer present */}

        {/* Enhanced Development Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-lg text-xs max-w-sm z-40 opacity-90 border border-slate-700 shadow-xl">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Room:</span>
                <span className="text-green-400">{roomID || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Call:</span>
                <span className={videoCallActive ? "text-green-400" : "text-red-400"}>
                  {videoCallActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invite:</span>
                <span className={isInviteJoin ? "text-blue-400" : "text-slate-500"}>
                  {isInviteJoin ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="text-yellow-400">{user?.name || 'None'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </TooltipProvider>
  );
}
