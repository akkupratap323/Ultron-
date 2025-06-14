import { CommentData } from "@/lib/types";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDeleteCommentMutation } from "./mutations";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteCommentDialogProps {
  comment: CommentData;
  open: boolean;
  onClose: () => void;
}

export default function DeleteCommentDialog({
  comment,
  open,
  onClose,
}: DeleteCommentDialogProps) {
  const mutation = useDeleteCommentMutation();

  function handleOpenChange(open: boolean) {
    if (!open || !mutation.isPending) {
      onClose();
    }
  }

  const handleDelete = () => {
    mutation.mutate(comment.id, {
      onSuccess: () => {
        toast.success("Comment deleted successfully");
        onClose();
      },
      onError: (error) => {
        toast.error("Failed to delete comment. Please try again.");
        console.error("Delete comment error:", error);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete comment?
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Are you sure you want to delete this comment? This action cannot be undone and the comment will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        {/* Comment Preview */}
        <div className="my-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comment.user.displayName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @{comment.user.username}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {comment.content}
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={handleDelete}
            loading={mutation.isPending}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Comment
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
