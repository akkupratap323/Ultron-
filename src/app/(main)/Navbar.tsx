import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { Bot, Sparkles, Zap } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white/95 via-white/98 to-white/95 dark:from-gray-900/95 dark:via-gray-900/98 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-gray-900/5 dark:shadow-gray-100/5">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-x"></div>
      
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
        {/* Enhanced Logo Section */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 text-2xl font-bold transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            {/* Logo Icon with animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            
            {/* Animated sparkle */}
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          </div>
          
          {/* Brand Text with Gradient */}
          <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent font-extrabold tracking-tight">
            Ultron
          </span>
          
          {/* Beta Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-sm">
            <Zap className="h-3 w-3" />
            AI
          </span>
        </Link>

        {/* Enhanced Search Field Container */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative group">
            {/* Search field background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <SearchField />
            </div>
          </div>
        </div>

        {/* Enhanced User Button Section */}
        <div className="flex items-center gap-4">
          {/* Navigation Links (optional) */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/explore" 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all duration-200"
            >
              Explore
            </Link>
            <Link 
              href="/messages" 
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-all duration-200"
            >
              Messages
            </Link>
          </nav>

          {/* Enhanced User Button */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <UserButton className="relative sm:ms-auto ring-2 ring-white dark:ring-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" />
          </div>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
    </header>
  );
}
