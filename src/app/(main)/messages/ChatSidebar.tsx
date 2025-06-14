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
import VideoCallButton from "@/components/VideoCallButton";
import { VideoStatus } from "@/components/VideoStatus";
import { useVideoClient } from "@/hooks/useVideoClient";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string };
}

export default function ChatSidebar({ open, onClose, currentUser }: ChatSidebarProps) {
  const { user } = useSession();
  const effectiveUser = currentUser || user;

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const queryClient = useQueryClient();
  const { channel } = useChatContext();
  const { isConnected, isLoading } = useVideoClient(effectiveUser);

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

  // Enhanced channel preview with better error handling
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
          {otherMembers.length === 1 && otherMembers[0].user && effectiveUser && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <VideoCallButton
                targetUser={{
                  id: otherMembers[0].user.id,
                  name:
                    typeof otherMembers[0].user.displayName === 'string' && otherMembers[0].user.displayName.trim()
                      ? otherMembers[0].user.displayName
                      : (typeof otherMembers[0].user.username === 'string' && otherMembers[0].user.username.trim()
                        ? otherMembers[0].user.username
                        : otherMembers[0].user.id)
                }}
                currentUser={{
                  id: effectiveUser.id,
                  name:
                    typeof (effectiveUser as any).displayName === 'string' && (effectiveUser as any).displayName.trim()
                      ? (effectiveUser as any).displayName
                      : (typeof (effectiveUser as any).username === 'string' && (effectiveUser as any).username.trim()
                        ? (effectiveUser as any).username
                        : effectiveUser.id)
                }}
                size="sm"
              />
            </div>
          )}
        </div>
      );
    },
    [onClose, effectiveUser],
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
        <span className="text-xs text-muted-foreground">Video Calls</span>
        <VideoStatus isConnected={isConnected} isLoading={isLoading} />
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
