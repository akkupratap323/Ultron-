"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FollowerInfo, UserData } from "@/lib/types";
import Link from "next/link";
import { PropsWithChildren } from "react";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";
import Linkify from "./Linkify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
  className?: string;
}

export default function UserTooltip({ children, user, className }: UserTooltipProps) {
  const { user: loggedInUser } = useSession();

  if (!loggedInUser) {
    return <>{children}</>;
  }

  const followerState: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: !!user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id,
    ),
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="start"
          className="p-0 border-0 shadow-xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-80 w-80"
        >
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            
            <div className="relative p-4 space-y-4">
              {/* Header with Avatar and Follow Button */}
              <div className="flex items-start justify-between gap-3">
                <Link href={`/users/${user.username}`} className="flex-shrink-0">
                  <UserAvatar 
                    size={64} 
                    avatarUrl={user.avatarUrl}
                    showBorder
                    className="ring-4 ring-white dark:ring-gray-800 shadow-lg hover:scale-105 transition-transform duration-200"
                  />
                </Link>
                {loggedInUser.id !== user.id && (
                  <FollowButton 
                    userId={user.id} 
                    initialState={followerState}
                  />
                )}
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <Link href={`/users/${user.username}`} className="block">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-1">
                      {user.displayName}
                    </h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    @{user.username}
                  </p>
                </Link>

                {/* User Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <FollowerCount userId={user.id} initialState={followerState} />
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="space-y-2">
                  <Linkify>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 whitespace-pre-line">
                      {user.bio}
                    </p>
                  </Linkify>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
