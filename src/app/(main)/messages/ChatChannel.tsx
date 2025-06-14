import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Video, Bot, Menu } from "lucide-react";
import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useChatContext,
} from "stream-chat-react";
import { useVideoClient } from "@/hooks/useVideoClient";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  currentUser?: { id: string; name: string };
  onStartVideoCall: () => void;
  onToggleAI: () => void;
}

export default function ChatChannel({
  open,
  openSidebar,
  currentUser,
  onStartVideoCall,
  onToggleAI,
}: ChatChannelProps) {
  const { channel } = useChatContext();
  const { videoClient } = useVideoClient(currentUser);

  const getOtherMembers = () => {
    if (!channel?.state.members || !currentUser) return [];
    return Object.values(channel.state.members).filter(
      (member) => member.user?.id !== currentUser.id
    );
  };

  const CustomChannelHeader = () => {
    const otherMembers = getOtherMembers();
    const isDirectMessage = otherMembers.length === 1;
    return (
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={openSidebar}
          >
            <Menu className="size-5" />
          </Button>
          <ChannelHeader />
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Video Call Button - only show for direct messages */}
          {isDirectMessage && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onStartVideoCall}
              disabled={!videoClient}
              className="text-green-600 hover:bg-green-50 rounded-full"
              title={`Video call ${otherMembers[0]?.user?.name || "user"}`}
            >
              <Video className="size-5" />
            </Button>
          )}
          {/* AI Assistant Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleAI}
            className="text-purple-600 hover:bg-purple-50 rounded-full"
            title="AI Assistant"
          >
            <Bot className="size-5" />
          </Button>
        </div>
      </div>
    );
  };

  if (!open) {
    return (
      <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
        <p className="text-muted-foreground">
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Channel>
        <Window>
          <CustomChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </div>
  );
}
