import { CommentData } from "@/lib/types";
import { MoreHorizontal, Trash2, Edit3, Flag, Copy, Share } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import DeleteCommentDialog from "./DeleteCommentDialog";
import { useSession } from "@/app/(main)/SessionProvider";
import { toast } from "sonner";

interface CommentMoreButtonProps {
  comment: CommentData;
  className?: string;
}

export default function CommentMoreButton({
  comment,
  className,
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useSession();

  const isOwner = user && comment.user.id === user.id;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/comments/${comment.id}`);
      toast.success("Comment link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comment by ${comment.user.displayName}`,
          text: comment.content,
          url: `${window.location.origin}/comments/${comment.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink();
    }
  };

  const handleReport = () => {
    // Implement report functionality
    toast.success("Comment reported. We'll review it shortly.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className={`
              h-8 w-8 rounded-full transition-all duration-200 
              hover:bg-gray-100 dark:hover:bg-gray-700 
              focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              ${className}
            `}
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-48 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl"
        >
          {isOwner ? (
            <>
              {/* Owner Actions */}
              <DropdownMenuItem 
                onClick={() => setShowEditDialog(true)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Edit3 className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-200">Edit comment</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">Copy link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-600" />
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-medium">Delete comment</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {/* Non-owner Actions */}
              <DropdownMenuItem 
                onClick={handleShare}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Share className="h-4 w-4 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-200">Share comment</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleCopyLink}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-200">Copy link</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-600" />
              
              <DropdownMenuItem 
                onClick={handleReport}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer transition-colors"
              >
                <Flag className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400">Report comment</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
      
      {/* You can add EditCommentDialog here if needed */}
      {/* <EditCommentDialog
        comment={comment}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      /> */}
    </>
  );
}
