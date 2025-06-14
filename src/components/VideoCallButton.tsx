import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useVideoClient } from "@/hooks/useVideoClient";

interface VideoCallButtonProps {
  targetUser: { id: string; name: string };
  currentUser: { id: string; name: string };
  size?: "sm" | "md" | "lg";
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  targetUser,
  currentUser,
  size = "md"
}) => {
  const { videoClient, isLoading, isConnected, error } = useVideoClient(currentUser);
  const [isInitiating, setIsInitiating] = useState(false);
  const [errorState, setError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("🔍 VideoCallButton Debug:", {
      hasVideoClient: !!videoClient,
      isLoading,
      isConnected,
      error,
      // Defensive: check for userId in state (Stream SDK may not always have .user)
      hasStateUserId: !!(videoClient && (videoClient.state as any).userId),
      stateUserId: videoClient ? (videoClient.state as any).userId : undefined,
      currentUser: currentUser.id,
      targetUser: targetUser.id
    });
  }, [videoClient, isLoading, isConnected, error, currentUser.id, targetUser.id]);

  const getUserIdFromState = () => {
    // Defensive: check for userId in state (Stream SDK may not always have .user)
    if (videoClient && (videoClient.state as any).userId) {
      return (videoClient.state as any).userId;
    }
    return undefined;
  };

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

  // Show loading state
  if (isLoading) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={`${sizeClasses[size]} bg-gray-400 rounded-full`}
        disabled
        title="Initializing video..."
      >
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      </Button>
    );
  }

  // Show error state
  if (errorState) {
    return (
      <Button
        size="icon"
        variant="ghost"
        className={`${sizeClasses[size]} bg-red-500 text-white rounded-full`}
        disabled
        title={`Error: ${errorState}`}
      >
        <Video className={iconSizes[size]} />
      </Button>
    );
  }

  const isDisabled = !videoClient || !isConnected || !getUserIdFromState() || isInitiating;

  const initiateVideoCall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError(null);

    // Enhanced validation
    if (!videoClient) {
      setError("Video client not available");
      console.error("❌ Video client not available");
      return;
    }

    if (!isConnected) {
      setError("Video client not connected");
      console.error("❌ Video client not connected");
      return;
    }

    const userId = getUserIdFromState();
    if (!userId) {
      setError("Video client user not set");
      console.error("❌ Video client user not set");
      return;
    }

    setIsInitiating(true);

    try {
      console.log("🎥 Initiating video call:", {
        from: currentUser.name,
        to: targetUser.name,
        clientUser: userId
      });

      const callId = `call-${currentUser.id}-${targetUser.id}-${Date.now()}`;
      const call = videoClient.call('default', callId);

      // Create call with ring enabled for notifications[2]
      await call.getOrCreate({
        ring: true,
        data: {
          members: [
            { user_id: currentUser.id },
            { user_id: targetUser.id }
          ],
        },
      });

      // Join the call
      await call.join({ create: true });

      console.log("✅ Video call initiated successfully");

    } catch (error: any) {
      console.error("❌ Failed to initiate video call:", error);
      setError(error.message || "Failed to start call");
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
