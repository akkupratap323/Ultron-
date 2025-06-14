import { PostData } from "@/lib/types";
import { Loader2, SendHorizonal, Smile, Image, AtSign } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "./mutations";
import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "../UserAvatar";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useSession();

  const mutation = useSubmitCommentMutation(post.id);

  // ✅ Early return if user is not logged in
  if (!user) {
    return (
      <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Please log in to write a comment
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    mutation.mutate(
      {
        post,
        content: input,
      },
      {
        onSuccess: () => {
          setInput("");
          setIsFocused(false);
        },
      },
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Main Input Area */}
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="flex-shrink-0 pt-1">
            <UserAvatar 
              avatarUrl={user.avatarUrl} 
              size={36} 
              className="rounded-full ring-2 ring-gray-100 dark:ring-gray-700" 
            />
          </div>

          {/* Input Container */}
          <div className="flex-1 relative">
            <div className={`
              relative rounded-2xl border transition-all duration-200 bg-gray-50 dark:bg-gray-800
              ${isFocused 
                ? 'border-blue-500 dark:border-blue-400 shadow-sm ring-2 ring-blue-500/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}>
              <Input
                placeholder="Write a comment..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className="border-0 bg-transparent px-4 py-3 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 resize-none min-h-[44px]"
                disabled={mutation.isPending}
              />
              
              {/* Character Counter */}
              {input.length > 200 && (
                <div className="absolute bottom-2 right-12 text-xs text-gray-400">
                  {280 - input.length}
                </div>
              )}
            </div>

            {/* Expanded Options */}
            {isFocused && (
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <AtSign className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400">
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">⌘</kbd> + 
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded ml-1">Enter</kbd> to post
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="flex-shrink-0 pt-1">
            <Button
              type="submit"
              disabled={!input.trim() || mutation.isPending}
              className={`
                h-9 w-9 rounded-full transition-all duration-200
                ${input.trim() && !mutation.isPending
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
              size="icon"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Loading State Overlay */}
        {mutation.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Posting your comment...</span>
          </div>
        )}
      </form>
    </div>
  );
}
