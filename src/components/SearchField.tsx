"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { User } from "lucide-react";

export default function SearchField() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.users);
        setShowDropdown(true);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300); // debounce
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search users…"
        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onFocus={() => query && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-2.5">
          <span className="loader h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></span>
        </div>
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-40 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
              onClick={() => setShowDropdown(false)}
            >
              <img
                src={user.avatarUrl || "/default-avatar.png"}
                alt={user.displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute z-40 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          No users found.
        </div>
      )}
    </div>
  );
}
