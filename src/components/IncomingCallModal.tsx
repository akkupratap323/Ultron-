"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  User, 
  Volume2,
  Loader2,
  MessageCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IncomingCallModalProps {
  call: any;
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallModal = ({ call, onAccept, onReject }: IncomingCallModalProps) => {
  const [isAnswering, setIsAnswering] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'joining' | 'joined' | 'leaving' | 'left'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Ringing animation
  useEffect(() => {
    const ringTimer = setInterval(() => {
      setIsRinging(prev => !prev);
    }, 1000);

    return () => clearInterval(ringTimer);
  }, []);

  // Call event listeners
  useEffect(() => {
    if (!call) return;

    const handleCallEnded = () => {
      console.log("📞 Call ended event received");
      setCallState('left');
      setIsAnswering(false);
      setIsRejecting(false);
    };

    const handleCallLeft = () => {
      console.log("📞 Call left event received");
      setCallState('left');
      setIsAnswering(false);
      setIsRejecting(false);
    };

    if (typeof call.on === 'function') {
      call.on('call.ended', handleCallEnded);
      call.on('call.left', handleCallLeft);
    }

    return () => {
      if (typeof call.off === 'function') {
        call.off('call.ended', handleCallEnded);
        call.off('call.left', handleCallLeft);
      }
    };
  }, [call]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (call && callState === 'joined') {
        call.leave().catch(console.error);
      }
    };
  }, [call, callState]);

  const handleAccept = async () => {
    if (callState !== 'idle') return;
    setIsAnswering(true);
    setCallState('joining');
    
    try {
      await call.join();
      setCallState('joined');
      onAccept();
      
      if (typeof call.on === 'function') {
        call.on('call.ended', () => {
          setCallState('left');
          setIsAnswering(false);
        });
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      setCallState('idle');
      setIsAnswering(false);
    }
  };

  const handleReject = async () => {
    if (callState === 'leaving' || callState === 'left') return;
    setIsRejecting(true);
    setCallState('leaving');
    
    try {
      if (typeof call.reject === 'function') {
        await call.reject();
      } else if (typeof call.leave === 'function') {
        await call.leave();
      }
      setCallState('left');
      onReject();
    } catch (error) {
      console.error('Failed to reject call:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const callerName = call?.state?.createdBy?.name || call?.state?.members?.[0]?.user?.name || 'Unknown';
  const callerAvatar = call?.state?.createdBy?.image || call?.state?.members?.[0]?.user?.image;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-pulse" />
      
      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/20">
        {/* Header with call status */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              <span className="text-sm font-medium">
                {callState === 'joining' ? 'Connecting...' : 'Incoming Video Call'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              {formatDuration(callDuration)}
            </div>
          </div>
        </div>

        {/* Caller info */}
        <div className="p-8 text-center">
          <div className="relative mb-6">
            <div className={cn(
              "w-24 h-24 mx-auto rounded-full border-4 transition-all duration-300",
              isRinging ? "border-green-400 shadow-lg shadow-green-400/50" : "border-green-300"
            )}>
              <Avatar className="w-full h-full">
                <AvatarImage src={callerAvatar} alt={callerName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {callerName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Ringing animation */}
            {isRinging && callState === 'idle' && (
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-green-400 animate-ping" />
            )}
            
            {/* Online indicator */}
            <div className="absolute bottom-2 right-1/2 transform translate-x-6 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
              <Video className="h-3 w-3 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {callerName}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            wants to video chat with you
          </p>

          {/* Call state indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {callState === 'joining' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">Connecting...</span>
              </>
            ) : callState === 'leaving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Ending call...</span>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-600 dark:text-green-400">Incoming call</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-8">
            {/* Reject button */}
            <div className="relative">
              <Button
                onClick={handleReject}
                disabled={isRejecting || callState === 'leaving' || callState === 'left'}
                className={cn(
                  "w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 border-0 shadow-lg transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  (isRejecting || callState === 'leaving') && "animate-pulse"
                )}
              >
                {isRejecting ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <PhoneOff className="h-6 w-6 text-white" />
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">Decline</p>
            </div>

            {/* Quick message button */}
            <div className="relative">
              <Button
                variant="outline"
                className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
                disabled={callState !== 'idle'}
              >
                <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </Button>
              <p className="text-xs text-gray-500 mt-2">Message</p>
            </div>

            {/* Accept button */}
            <div className="relative">
              <Button
                onClick={handleAccept}
                disabled={isAnswering || callState !== 'idle'}
                className={cn(
                  "w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 border-0 shadow-lg transition-all duration-300",
                  "hover:scale-110 active:scale-95",
                  isAnswering && "animate-pulse"
                )}
              >
                {isAnswering ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <Phone className="h-6 w-6 text-white" />
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">Accept</p>
            </div>
          </div>

          {/* Additional options */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <Volume2 className="h-4 w-4" />
                Sound
              </button>
              <span>•</span>
              <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <VideoOff className="h-4 w-4" />
                Video Off
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced safe leave function
export const safeLeaveCall = async (callInstance: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!callInstance || callInstance.state?.callingState === 'left') {
        console.log("Call already left or invalid");
        return;
      }
      
      await callInstance.leave();
      console.log("✅ Successfully left call");
      return;
    } catch (error: any) {
      if (error.message?.includes('already been left')) {
        console.log("Call was already left");
        return;
      }
      
      if (attempt === maxRetries) {
        console.error(`❌ Failed to leave call after ${maxRetries} attempts:`, error);
        throw error;
      }
      
      console.warn(`⚠️ Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

export default IncomingCallModal;
