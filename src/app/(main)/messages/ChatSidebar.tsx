import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MailPlus, X, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string };
  onStartVideoCall?: (targetUserId: string, targetUserName: string) => void;
}

export default function ChatSidebar({ 
  open, 
  onClose, 
  currentUser,
  onStartVideoCall 
}: ChatSidebarProps) {
  const { user } = useSession();
  const effectiveUser = currentUser || user;

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const queryClient = useQueryClient();
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  // Enhanced channel preview with ZEGOCLOUD video call integration
  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => {
      const otherMembers = props.channel.state.members 
        ? Object.values(props.channel.state.members).filter(
            member => member.user?.id !== effectiveUser?.id
          )
        : [];

      // Debug logging for channel members
      console.log("🔍 Channel members:", {
        channelId: props.channel.id,
        totalMembers: Object.keys(props.channel.state.members || {}).length,
        otherMembers: otherMembers.length,
        effectiveUserId: effectiveUser?.id
      });

      const handleVideoCall = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent channel selection
        if (otherMembers[0]?.user && onStartVideoCall) {
          const targetUser = otherMembers[0].user;
          const targetUserName = typeof targetUser.displayName === 'string' && targetUser.displayName.trim()
            ? targetUser.displayName
            : (typeof targetUser.username === 'string' && targetUser.username.trim()
              ? targetUser.username
              : targetUser.id);
          
          onStartVideoCall(targetUser.id, targetUserName);
        }
      };

      return (
        <div className="relative group">
          <ChannelPreviewMessenger
            {...props}
            onSelect={() => {
              props.setActiveChannel?.(props.channel, props.watchers);
              onClose();
            }}
          />
          {/* Video call button overlay - only for 1-on-1 chats */}
          {otherMembers.length === 1 && otherMembers[0].user && effectiveUser && onStartVideoCall && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVideoCall}
                className="text-green-600 hover:bg-green-50 rounded-full p-2"
                title={`Video call ${otherMembers[0].user.displayName || otherMembers[0].user.username || otherMembers[0].user.id}`}
              >
                <Video className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      );
    },
    [onClose, effectiveUser, onStartVideoCall],
  );

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!effectiveUser?.id) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      <div className="flex items-center justify-between px-4 pb-1">
        <span className="text-xs text-muted-foreground">Conversations</span>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600">ZEGOCLOUD Ready</span>
        </div>
      </div>
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [effectiveUser.id] },
        }}
        showChannelSearch
        options={{ state: true, presence: true, limit: 8 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: {
            channelFilters: {
              filters: { members: { $in: [effectiveUser.id] } },
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
