import React from "react";
import { Loader2, Video, VideoOff } from "lucide-react";

interface VideoStatusProps {
  isConnected: boolean;
  isLoading: boolean;
}

export const VideoStatus: React.FC<VideoStatusProps> = ({ isConnected, isLoading }) => {
  if (isLoading) {
    return (
      <span title="Video system loading" className="flex items-center text-yellow-500">
        <Loader2 className="animate-spin mr-1 w-4 h-4" />
        <span className="text-xs">Loading</span>
      </span>
    );
  }
  if (isConnected) {
    return (
      <span title="Video system connected" className="flex items-center text-green-600">
        <Video className="mr-1 w-4 h-4" />
        <span className="text-xs">Ready</span>
      </span>
    );
  }
  return (
    <span title="Video system unavailable" className="flex items-center text-gray-400">
      <VideoOff className="mr-1 w-4 h-4" />
      <span className="text-xs">Unavailable</span>
    </span>
  );
};
