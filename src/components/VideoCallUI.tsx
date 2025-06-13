import React from 'react';
import {
  CallingState,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCallStateHooks,
  ParticipantView,
  useCall,
} from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { PhoneOff } from 'lucide-react';

interface VideoCallUIProps {
  onLeave: () => void;
}

export const VideoCallUI: React.FC<VideoCallUIProps> = ({ onLeave }) => {
  const call = useCall();
  const { useCallCallingState, useLocalParticipant, useRemoteParticipants } = useCallStateHooks();
  
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme className="h-full">
      <div className="relative h-full bg-gray-900">
        {/* Main video layout */}
        <SpeakerLayout />
        
        {/* Custom leave button */}
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={onLeave}
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave Call
          </Button>
        </div>

        {/* Call controls at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <CallControls onLeave={onLeave} />
        </div>
      </div>
    </StreamTheme>
  );
};
