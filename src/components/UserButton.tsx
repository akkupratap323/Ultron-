"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Check, 
  LogOutIcon, 
  Monitor, 
  Moon, 
  Sun, 
  UserIcon, 
  Settings, 
  HelpCircle, 
  Bell,
  Bookmark
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  
  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!user) {
    return null;
  }

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "flex-none rounded-full ring-2 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700 transition-all duration-200 hover:shadow-md",
            className
          )}
        >
          <UserAvatar 
            avatarUrl={user.avatarUrl} 
            size={40}
            showBorder
            className="hover:scale-105 transition-transform duration-200"
          />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl"
      >
        {/* User Info Header */}
        <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <UserAvatar avatarUrl={user.avatarUrl} size={48} showBorder />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.displayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Main Menu Items */}
        <div className="py-2">
          <Link href={`/users/${user.username}`}>
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Profile</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/bookmarks">
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Bookmark className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Bookmarks</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/notifications">
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Notifications</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/settings">
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">Settings</span>
            </DropdownMenuItem>
          </Link>
        </div>

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-600" />

        {/* Theme Selector */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="w-48 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl">
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">System</span>
                </div>
                {theme === "system" && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-200">Light</span>
                </div>
                {theme === "light" && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-200">Dark</span>
                </div>
                {theme === "dark" && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Help & Support */}
        <Link href="/help">
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <HelpCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Help & Support</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-600" />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full">
            <LogOutIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium text-red-600 dark:text-red-400">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
