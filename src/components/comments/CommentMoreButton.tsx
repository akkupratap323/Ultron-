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
  className?: string; // ✅ Add this line
}

export default function CommentMoreButton({
  comment,
  className, // ✅ Add this parameter
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useSession();

  const isOwner = user && comment.user.id === user.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className={className} // ✅ Apply className here
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
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer transition-colors">
                <Flag className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600 dark:text-orange-400">Report comment</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCommentDialog
        comment={comment}
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
