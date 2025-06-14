import kyInstance from "@/lib/ky";
import { CommentsPage, PostData } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";

interface CommentsProps {
  post: PostData;
}

export default function Comments({ post }: CommentsProps) {
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetching, 
    status, 
    error,
    refetch 
  } = useInfiniteQuery({
    queryKey: ["comments", post.id],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/${post.id}/comments`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<CommentsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (firstPage) => firstPage.previousCursor,
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Comment Input */}
      <CommentInput post={post} />

      {/* Comments Section */}
      <div className="px-4 pb-4">
        {/* Load Previous Comments Button */}
        {hasNextPage && (
          <div className="flex justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={isFetching}
              onClick={() => fetchNextPage()}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors duration-200"
            >
              {isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load previous comments
                </>
              )}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {status === "pending" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Failed to load comments
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : "Something went wrong"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {status === "success" && !comments.length && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No comments yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Be the first to share your thoughts!
              </p>
            </div>
          </div>
        )}

        {/* Comments List */}
        {status === "success" && comments.length > 0 && (
          <div className="space-y-1">
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={`
                  ${index !== comments.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}
                `}
              >
                <Comment comment={comment} />
              </div>
            ))}
          </div>
        )}

        {/* Comments Count */}
        {status === "success" && comments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              {hasNextPage && ' • More available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
