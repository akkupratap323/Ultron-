"use client";

import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
  alt?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
  showBorder?: boolean;
  priority?: boolean;
}

export default function UserAvatar({
  avatarUrl,
  size = 48,
  className,
  alt = "User avatar",
  showOnlineStatus = false,
  isOnline = false,
  showBorder = false,
  priority = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Calculate status indicator size based on avatar size
  const statusSize = Math.max(8, size * 0.2);
  const statusPosition = size * 0.1;

  return (
    <div className="relative inline-block">
      {avatarUrl && !imageError ? (
        <Image
          src={avatarUrl}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          className={cn(
            "aspect-square h-fit flex-none rounded-full bg-gray-100 dark:bg-gray-800 object-cover transition-all duration-200",
            showBorder && "ring-2 ring-white dark:ring-gray-800 shadow-sm",
            "hover:shadow-md hover:scale-105",
            className,
          )}
          onError={handleImageError}
        />
      ) : (
        // Fallback when no avatar or image fails to load
        <div
          className={cn(
            "aspect-square h-fit flex-none rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-200",
            showBorder && "ring-2 ring-white dark:ring-gray-800 shadow-sm",
            "hover:shadow-md hover:scale-105",
            className,
          )}
          style={{ width: size, height: size }}
        >
          {avatarPlaceholder ? (
            <Image
              src={avatarPlaceholder}
              alt={alt}
              width={size}
              height={size}
              className="aspect-square h-fit flex-none rounded-full object-cover"
            />
          ) : (
            <User 
              className="text-white" 
              size={size * 0.5} 
            />
          )}
        </div>
      )}

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div
          className={cn(
            "absolute rounded-full border-2 border-white dark:border-gray-800",
            isOnline ? "bg-green-500" : "bg-gray-400",
          )}
          style={{
            width: statusSize,
            height: statusSize,
            bottom: statusPosition,
            right: statusPosition,
          }}
        />
      )}
    </div>
  );
}

// Specialized avatar variants for different use cases
export function UserAvatarWithStory({
  avatarUrl,
  size = 48,
  className,
  hasStory = false,
  storyViewed = false,
  ...props
}: UserAvatarProps & { hasStory?: boolean; storyViewed?: boolean }) {
  return (
    <div className="relative">
      {hasStory && (
        <div
          className={cn(
            "absolute inset-0 rounded-full p-0.5",
            storyViewed 
              ? "bg-gray-300 dark:bg-gray-600" 
              : "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600"
          )}
          style={{ width: size + 4, height: size + 4 }}
        >
          <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 p-0.5">
            <UserAvatar
              avatarUrl={avatarUrl}
              size={size - 8}
              className={className}
              {...props}
            />
          </div>
        </div>
      )}
      {!hasStory && (
        <UserAvatar
          avatarUrl={avatarUrl}
          size={size}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}

// Avatar group for showing multiple users
export function UserAvatarGroup({
  avatars,
  maxVisible = 3,
  size = 32,
  className,
}: {
  avatars: Array<{ avatarUrl?: string | null; alt?: string }>;
  maxVisible?: number;
  size?: number;
  className?: string;
}) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleAvatars.map((avatar, index) => (
        <UserAvatar
          key={index}
          avatarUrl={avatar.avatarUrl}
          alt={avatar.alt}
          size={size}
          showBorder
          className="hover:z-10 transition-all duration-200"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "aspect-square flex-none rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800 hover:z-10 transition-all duration-200"
          )}
          style={{ width: size, height: size }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
