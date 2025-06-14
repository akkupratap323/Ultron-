"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare, Share, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import SafePostImage from "@/components/SafePostImage";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-start gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`} className="flex-shrink-0">
              <UserAvatar 
                avatarUrl={post.user.avatarUrl} 
                size={44}
                className="ring-2 ring-white dark:ring-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </Link>
          </UserTooltip>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <UserTooltip user={post.user}>
                <Link
                  href={`/users/${post.user.username}`}
                  className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  {post.user.displayName}
                </Link>
              </UserTooltip>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                @{post.user.username}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <Link
                href={`/posts/${post.id}`}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                suppressHydrationWarning
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
            </div>
          </div>
        </div>
        {user && post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 group-hover/post:opacity-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1.5"
          />
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <Linkify>
          <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line break-words">
            {post.content}
          </div>
        </Linkify>
      </div>

      {/* Media Attachments */}
      {!!post.attachments.length && (
        <div className="px-4 pb-3">
          <MediaPreviews attachments={post.attachments} />
        </div>
      )}

      {/* Action Bar */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <LikeButton
              postId={post.id}
              initialState={{
                likes: post._count.likes,
                isLikedByUser: user ? post.likes.some((like) => like.userId === user.id) : false,
              }}
            />
            <CommentButton
              post={post}
              onClick={() => setShowComments(!showComments)}
              isActive={showComments}
            />
            <ShareButton post={post} />
          </div>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: user ? post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id,
              ) : false,
            }}
          />
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <Comments post={post} />
        </div>
      )}
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700",
        attachments.length === 1 && "max-h-[500px]",
        attachments.length > 1 && "grid gap-1",
        attachments.length === 2 && "grid-cols-2",
        attachments.length === 3 && "grid-cols-2 grid-rows-2",
        attachments.length === 4 && "grid-cols-2 grid-rows-2",
        attachments.length > 4 && "grid-cols-3"
      )}
    >
      {attachments.map((m, index) => (
        <MediaPreview 
          key={m.id} 
          media={m} 
          index={index}
          totalCount={attachments.length}
        />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
  index?: number;
  totalCount?: number;
}

function MediaPreview({ media, index = 0, totalCount = 1 }: MediaPreviewProps) {
  const isFirstInGrid = index === 0;
  const shouldSpanRows = totalCount === 3 && index === 0;

  if (media.type === "IMAGE") {
    return (
      <div className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        shouldSpanRows && "row-span-2"
      )}>
        <SafePostImage
          src={media.url}
          alt="Post attachment"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className={cn(
        "relative overflow-hidden bg-gray-100 dark:bg-gray-800",
        shouldSpanRows && "row-span-2"
      )}>
        <video
          src={media.url}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">Unsupported media type</p>
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
  isActive?: boolean;
}

function CommentButton({ post, onClick, isActive = false }: CommentButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors duration-200 group/comment",
        isActive && "text-blue-500"
      )}
    >
      <MessageSquare className="w-5 h-5 group-hover/comment:scale-110 transition-transform duration-200" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}
        <span className="hidden sm:inline ml-1">
          {post._count.comments === 1 ? 'comment' : 'comments'}
        </span>
      </span>
    </button>
  );
}

interface ShareButtonProps {
  post: PostData;
}

function ShareButton({ post }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.user.displayName}`,
          text: post.content,
          url: `${window.location.origin}/posts/${post.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors duration-200 group/share"
    >
      <Share className="w-5 h-5 group-hover/share:scale-110 transition-transform duration-200" />
      <span className="text-sm font-medium hidden sm:inline">Share</span>
    </button>
  );
}
