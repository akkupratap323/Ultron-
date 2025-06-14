"use client";

import kyInstance from "@/lib/ky";
import { UserData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { HTTPError } from "ky";
import Link from "next/link";
import { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";
import { cn } from "@/lib/utils";
import { User, AlertCircle } from "lucide-react";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
  className?: string;
  showLoadingState?: boolean;
}

export default function UserLinkWithTooltip({
  children,
  username,
  className,
  showLoadingState = false,
}: UserLinkWithTooltipProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-data", username],
    queryFn: () =>
      kyInstance.get(`/api/users/username/${username}`).json<UserData>(),
    retry(failureCount, error) {
      if (error instanceof HTTPError && error.response.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle error state (user not found)
  if (error instanceof HTTPError && error.response.status === 404) {
    return (
      <span 
        className={cn(
          "text-gray-500 dark:text-gray-400 cursor-not-allowed inline-flex items-center gap-1",
          className
        )}
        title="User not found"
      >
        <AlertCircle className="h-3 w-3" />
        {children}
      </span>
    );
  }

  // Loading state
  if (isLoading && showLoadingState) {
    return (
      <span 
        className={cn(
          "text-purple-600 dark:text-purple-400 animate-pulse inline-flex items-center gap-1",
          className
        )}
      >
        <User className="h-3 w-3" />
        {children}
      </span>
    );
  }

  // No data yet (loading or initial state)
  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className={cn(
          "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors duration-200 font-medium",
          className
        )}
      >
        {children}
      </Link>
    );
  }

  // Success state with tooltip
  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className={cn(
          "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors duration-200 font-medium inline-flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-1 py-0.5 rounded-md",
          className
        )}
      >
        {children}
      </Link>
    </UserTooltip>
  );
}
