import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { Bot, Sparkles, Brain } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white hover:scale-105 transition-transform duration-200"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-md">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Ultron
          </span>
        </Link>

        {/* Search Field */}
        <div className="flex-1 max-w-md">
          <SearchField />
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/custom-ai"
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors duration-200"
          >
            <Brain className="h-4 w-4" />
            Characters Model
          </Link>
        </nav>

        {/* User Button */}
        <div className="relative">
          <UserButton className="ring-2 ring-white dark:ring-gray-800 shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105" />
        </div>
      </div>
    </header>
  );
}
