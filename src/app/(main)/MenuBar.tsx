import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-md"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home className="w-5 h-5" />
          <span className="hidden lg:inline font-medium">Home</span>
        </Link>
      </Button>
      
      {/* Wrap NotificationsButton in a div to apply styling */}
      <div className="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-md">
        <NotificationsButton
          initialState={{ unreadCount: unreadNotificationsCount }}
        />
      </div>
      
      {/* Wrap MessagesButton in a div to apply styling */}
      <div className="px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-md">
        <MessagesButton 
          initialState={{ unreadCount: unreadMessagesCount }}
        />
      </div>
      
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:shadow-md"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark className="w-5 h-5" />
          <span className="hidden lg:inline font-medium">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
}
