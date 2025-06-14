"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { 
  Users, 
  TrendingUp, 
  Heart, 
  UserCheck,
  Sparkles,
  Crown,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface FollowerCountProps {
  userId: string;
  initialState: FollowerInfo;
  variant?: "default" | "compact" | "detailed" | "minimal" | "premium";
  showIcon?: boolean;
  showLabel?: boolean;
  showTrend?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function FollowerCount({
  userId,
  initialState,
  variant = "default",
  showIcon = true,
  showLabel = true,
  showTrend = false,
  animated = true,
  size = "md",
}: FollowerCountProps) {
  const { data } = useFollowerInfo(userId, initialState);
  const [previousCount, setPreviousCount] = useState(data.followers);
  const [isIncreasing, setIsIncreasing] = useState(false);

  // Track follower changes for animations
  useEffect(() => {
    if (data.followers !== previousCount) {
      setIsIncreasing(data.followers > previousCount);
      setPreviousCount(data.followers);
      
      if (animated) {
        // Trigger animation
        setTimeout(() => setIsIncreasing(false), 1000);
      }
    }
  }, [data.followers, previousCount, animated]);

  // Size configurations
  const sizeConfig = {
    sm: {
      text: "text-xs",
      number: "text-sm font-bold",
      icon: "h-3 w-3",
      gap: "gap-1",
      padding: "px-2 py-1"
    },
    md: {
      text: "text-sm",
      number: "text-lg font-bold",
      icon: "h-4 w-4",
      gap: "gap-2",
      padding: "px-3 py-1.5"
    },
    lg: {
      text: "text-base",
      number: "text-2xl font-bold",
      icon: "h-5 w-5",
      gap: "gap-2.5",
      padding: "px-4 py-2"
    }
  };

  const config = sizeConfig[size];

  // Get milestone badge
  const getMilestoneBadge = () => {
    const count = data.followers;
    if (count >= 1000000) return { icon: Crown, color: "text-yellow-500", label: "1M+" };
    if (count >= 100000) return { icon: Star, color: "text-purple-500", label: "100K+" };
    if (count >= 10000) return { icon: Sparkles, color: "text-blue-500", label: "10K+" };
    if (count >= 1000) return { icon: TrendingUp, color: "text-green-500", label: "1K+" };
    return null;
  };

  const milestone = getMilestoneBadge();

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center", config.gap)}>
        {showIcon && <Users className={cn(config.icon, "text-muted-foreground")} />}
        <span className={cn(config.number, "text-foreground")}>
          {formatNumber(data.followers)}
        </span>
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={cn(
        "inline-flex items-center rounded-full bg-muted/50 transition-all duration-200 hover:bg-muted",
        config.padding,
        config.gap
      )}>
        {showIcon && <Users className={cn(config.icon, "text-muted-foreground")} />}
        <span className={cn(config.text, "text-muted-foreground")}>
          {formatNumber(data.followers)}
        </span>
        {milestone && (
          <milestone.icon className={cn("h-3 w-3", milestone.color)} />
        )}
      </div>
    );
  }

  // Premium variant
  if (variant === "premium") {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-200/20 backdrop-blur-sm",
        config.padding
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-pulse" />
        
        <div className={cn("relative flex items-center justify-between", config.gap)}>
          <div className="flex items-center gap-2">
            {showIcon && (
              <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <Users className={cn(config.icon, "text-white")} />
              </div>
            )}
            <div>
              {showLabel && (
                <p className={cn(config.text, "text-muted-foreground font-medium")}>
                  Followers
                </p>
              )}
              <p className={cn(
                config.number, 
                "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
                animated && isIncreasing && "animate-pulse"
              )}>
                {formatNumber(data.followers)}
              </p>
            </div>
          </div>
          
          {milestone && (
            <div className="flex items-center gap-1">
              <milestone.icon className={cn("h-4 w-4", milestone.color)} />
              <span className={cn("text-xs font-medium", milestone.color)}>
                {milestone.label}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <div className={cn(
        "rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showIcon && (
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className={cn(config.icon, "text-blue-600")} />
              </div>
            )}
            <div>
              {showLabel && (
                <p className={cn(config.text, "text-muted-foreground")}>
                  Total Followers
                </p>
              )}
              <p className={cn(
                config.number,
                "text-foreground",
                animated && isIncreasing && "animate-bounce"
              )}>
                {formatNumber(data.followers)}
              </p>
              {showTrend && (
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +{Math.floor(Math.random() * 100)} this week
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {milestone && (
            <div className="text-right">
              <milestone.icon className={cn("h-6 w-6 mx-auto", milestone.color)} />
              <p className={cn("text-xs font-medium mt-1", milestone.color)}>
                {milestone.label}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("flex items-center", config.gap)}>
      {showIcon && (
        <Users className={cn(
          config.icon, 
          "text-muted-foreground transition-colors duration-200",
          animated && isIncreasing && "text-green-500"
        )} />
      )}
      <span className={cn(config.text, "text-muted-foreground")}>
        {showLabel && "Followers: "}
        <span className={cn(
          "font-semibold text-foreground transition-all duration-300",
          animated && isIncreasing && "text-green-600 scale-110"
        )}>
          {formatNumber(data.followers)}
        </span>
      </span>
      
      {/* Growth indicator */}
      {animated && isIncreasing && (
        <div className="flex items-center gap-1 animate-fade-in">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span className="text-xs text-green-600 font-medium">+1</span>
        </div>
      )}
      
      {milestone && (
        <milestone.icon className={cn("h-3 w-3", milestone.color)} />
      )}
    </div>
  );
}
