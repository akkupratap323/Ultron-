"use client";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useRef, useState } from 'react';

interface ZEGOCLOUDProps {
  roomID: string;
  userID: string;
  userName: string;
  onCallEnd?: () => void;
  isInviteJoin?: boolean;
}

const ZEGOCLOUD: React.FC<ZEGOCLOUDProps> = ({ 
  roomID, 
  userID, 
  userName, 
  onCallEnd,
  isInviteJoin = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<any>(null);
  const isDestroyingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Ensure component only initializes on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isJoining || !roomID || !userID || hasInitializedRef.current) return;

    const initializeCall = async () => {
      if (!containerRef.current || isDestroyingRef.current) return;

      try {
        hasInitializedRef.current = true;
        setIsJoining(true);
        setConnectionError(null);

        // Force cleanup any existing instance with proper guards
        await safeDestroy();

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

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = zp;
        
        await zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Invite Others to Join',
              url: `${window.location.origin}/messages?roomID=${finalRoomID}&action=join&userName=${encodeURIComponent(userName)}`,
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
            console.log('✅ Successfully joined ZEGO room:', finalRoomID);
            setIsJoining(false);
            setConnectionError(null);
          },
          onLeaveRoom: () => {
            console.log('📞 Left ZEGO room');
            safeCleanup();
            if (onCallEnd) onCallEnd();
          },
          onUserJoin: (users: any[]) => {
            console.log('👥 Users joined:', users);
          },
          onUserLeave: (users: any[]) => {
            console.log('👋 Users left:', users);
          }
        });

      } catch (error: any) {
        console.error('❌ Error initializing ZEGOCLOUD:', error);
        setConnectionError(error.message || 'Failed to initialize video call');
        setIsJoining(false);
        hasInitializedRef.current = false;
        if (onCallEnd) onCallEnd();
      }
    };

    // Safe destroy function with guards against double cleanup
    const safeDestroy = async () => {
      if (isDestroyingRef.current || !zegoInstanceRef.current) return;
      
      try {
        isDestroyingRef.current = true;
        await zegoInstanceRef.current.destroy();
        zegoInstanceRef.current = null;
      } catch (error) {
        console.warn('Warning during ZEGO instance destruction:', error);
        // Force null the reference even if destroy fails
        zegoInstanceRef.current = null;
      } finally {
        isDestroyingRef.current = false;
      }
    };

    const safeCleanup = () => {
      if (!isDestroyingRef.current) {
        safeDestroy();
      }
      setIsJoining(false);
      setConnectionError(null);
      hasInitializedRef.current = false;
    };

    initializeCall();

    // Enhanced cleanup function with proper guards
    return () => {
      safeCleanup();
    };
  }, [isClient, roomID, userID, userName, onCallEnd, isInviteJoin]);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-white">Initializing video call...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-lg overflow-hidden bg-gray-900 relative"
      ref={containerRef}
      style={{ minHeight: '400px' }}
    >
      {isJoining && (
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Connecting to video call...</p>
            <p className="text-sm opacity-75 mt-2">
              {isInviteJoin ? 'Joining via invite link...' : 'Starting new call...'}
            </p>
          </div>
        </div>
      )}
      
      {connectionError && (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400 text-center">
            <p className="mb-4">❌ {connectionError}</p>
            <button 
              onClick={() => {
                setConnectionError(null);
                hasInitializedRef.current = false;
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZEGOCLOUD;
