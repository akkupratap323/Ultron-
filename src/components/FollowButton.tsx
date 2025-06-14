"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { 
  UserPlus, 
  UserMinus, 
  Check, 
  Heart, 
  Users,
  Loader2,
  Star,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
  variant?: "default" | "compact" | "icon" | "premium";
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function FollowButton({
  userId,
  initialState,
  variant = "default",
  showCount = false,
  size = "md",
}: FollowButtonProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

      return { previousState };
    },
    onSuccess: () => {
      if (!data.isFollowedByUser) {
        setJustFollowed(true);
        setTimeout(() => setJustFollowed(false), 2000);
        toast({
          description: "Successfully followed! 🎉",
          duration: 3000,
        });
      }
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const handleClick = () => {
    mutate();
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "h-8 px-3 text-xs",
      icon: "h-3 w-3",
      gap: "gap-1.5"
    },
    md: {
      button: "h-9 px-4 text-sm",
      icon: "h-4 w-4", 
      gap: "gap-2"
    },
    lg: {
      button: "h-11 px-6 text-base",
      icon: "h-5 w-5",
      gap: "gap-2.5"
    }
  };

  const config = sizeConfig[size];

  // Icon-only variant
  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:scale-110",
          data.isFollowedByUser
            ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
            : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400",
          config.button
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPending ? (
          <Loader2 className={cn(config.icon, "animate-spin")} />
        ) : data.isFollowedByUser ? (
          isHovered ? (
            <UserMinus className={config.icon} />
          ) : (
            <UserCheck className={config.icon} />
          )
        ) : (
          <UserPlus className={config.icon} />
        )}
      </Button>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <Button
        variant={data.isFollowedByUser ? "outline" : "default"}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          config.button,
          config.gap,
          data.isFollowedByUser
            ? "hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isPending ? (
          <Loader2 className={cn(config.icon, "animate-spin")} />
        ) : data.isFollowedByUser ? (
          <>
            {isHovered ? <UserMinus className={config.icon} /> : <Check className={config.icon} />}
            {isHovered ? "Unfollow" : "Following"}
          </>
        ) : (
          <>
            <UserPlus className={config.icon} />
            Follow
          </>
        )}
      </Button>
    );
  }

  // Premium variant
  if (variant === "premium") {
    return (
      <Button
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "relative overflow-hidden transition-all duration-500 group",
          config.button,
          config.gap,
          data.isFollowedByUser
            ? "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 border border-gray-300 hover:border-red-300 dark:from-gray-800 dark:to-gray-700 dark:text-gray-300 dark:hover:from-red-950/20 dark:hover:to-red-900/20"
            : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {isPending ? (
          <Loader2 className={cn(config.icon, "animate-spin")} />
        ) : data.isFollowedByUser ? (
          <>
            {isHovered ? <UserMinus className={config.icon} /> : <Star className={config.icon} />}
            {isHovered ? "Unfollow" : "Following"}
          </>
        ) : (
          <>
            <Heart className={config.icon} />
            Follow
          </>
        )}
        
        {justFollowed && (
          <div className="absolute inset-0 bg-green-500 flex items-center justify-center rounded-md">
            <Check className={cn(config.icon, "text-white")} />
          </div>
        )}
      </Button>
    );
  }

  // Default variant with follower count
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={data.isFollowedByUser ? "outline" : "default"}
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "relative overflow-hidden transition-all duration-300 group",
          config.button,
          config.gap,
          data.isFollowedByUser
            ? "hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400"
            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 shadow-md hover:shadow-lg"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading state */}
        {isPending ? (
          <>
            <Loader2 className={cn(config.icon, "animate-spin")} />
            {data.isFollowedByUser ? "Unfollowing..." : "Following..."}
          </>
        ) : data.isFollowedByUser ? (
          <>
            {isHovered ? (
              <UserMinus className={config.icon} />
            ) : (
              <Check className={config.icon} />
            )}
            {isHovered ? "Unfollow" : "Following"}
          </>
        ) : (
          <>
            <UserPlus className={config.icon} />
            Follow
          </>
        )}

        {/* Success animation */}
        {justFollowed && (
          <div className="absolute inset-0 bg-green-500 flex items-center justify-center rounded-md transition-all duration-500">
            <Check className={cn(config.icon, "text-white")} />
          </div>
        )}
      </Button>

      {/* Follower count */}
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          <span className="font-medium">
            {data.followers.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
