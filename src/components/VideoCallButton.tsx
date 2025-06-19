// components/VideoCallButton.tsx
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { useState } from "react";
import { StreamVideoClient } from '@stream-io/video-react-sdk';

interface VideoCallButtonProps {
  targetUser: { id: string; name: string };
  currentUser: { id: string; name: string };
  videoClient?: StreamVideoClient;
  isConnected: boolean;
  onCallStart?: (call: any) => void;
  size?: "sm" | "md" | "lg";
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  targetUser,
  currentUser,
  videoClient,
  isConnected,
  onCallStart,
  size = "md"
}) => {
  const [isInitiating, setIsInitiating] = useState(false);

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const isDisabled = !videoClient || !isConnected || isInitiating;

  const initiateVideoCall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!videoClient || !isConnected) {
      console.error("❌ Video client not available or not connected");
      return;
    }

    setIsInitiating(true);

    try {
      console.log("🎥 Initiating video call:", {
        from: currentUser.name,
        to: targetUser.name,
      });

      const callId = `call-${currentUser.id}-${targetUser.id}-${Date.now()}`;
      const call = videoClient.call('default', callId);

      // Create call with ring enabled for notifications
      await call.getOrCreate({
        ring: true,
        data: {
          members: [
            { user_id: currentUser.id },
            { user_id: targetUser.id }
          ],
        },
      });

      // Notify parent component about the call
      if (onCallStart) {
        onCallStart(call);
      }

      console.log("✅ Video call initiated successfully");

    } catch (error: any) {
      console.error("❌ Failed to initiate video call:", error);
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className={`${sizeClasses[size]} ${
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600'
      } text-white rounded-full transition-colors`}
      onClick={initiateVideoCall}
      disabled={isDisabled}
      title={
        isDisabled
          ? "Video calling unavailable"
          : `Video call ${targetUser.name}`
      }
    >
      {isInitiating ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Video className={iconSizes[size]} />
      )}
    </Button>
  );
};

export default VideoCallButton;
