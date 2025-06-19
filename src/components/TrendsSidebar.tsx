import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Loader2, TrendingUp, Users, Hash, ChevronRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] hidden h-fit w-72 flex-none space-y-4 md:block lg:w-80">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      }>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;

  // Get more users but only show 2 initially
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 10, // Get more users to ensure we have enough for "Show more"
  });

  if (usersToFollow.length === 0) return null;

  // Show only first 2 users
  const displayedUsers = usersToFollow.slice(0, 2);
  const remainingCount = usersToFollow.length - 2;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Who to follow
        </h2>
      </div>

      {/* User List - Only show first 2 */}
      <div className="p-4 space-y-4">
        {displayedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between gap-3 group">
            <UserTooltip user={user}>
              <Link
                href={`/users/${user.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <UserAvatar 
                  avatarUrl={user.avatarUrl} 
                  size={44}
                  className="flex-none ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-200" 
                />
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 break-all font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    {user.displayName}
                  </p>
                  <p className="line-clamp-1 break-all text-gray-500 dark:text-gray-400 text-xs">
                    @{user.username}
                  </p>
                  {user._count.followers > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatNumber(user._count.followers)} followers
                    </p>
                  )}
                </div>
              </Link>
            </UserTooltip>
            <FollowButton
              userId={user.id}
              initialState={{
                followers: user._count.followers,
                isFollowedByUser: user.followers.some(
                  ({ followerId }) => followerId === user.id,
                ),
              }}
            />
          </div>
        ))}
      </div>

      {/* Show More Link - Only show if there are more users */}
      {remainingCount > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <Link 
            href="/explore/people"
            className="flex items-center justify-between p-4 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 rounded-b-2xl group"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">Show more</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {remainingCount} more {remainingCount === 1 ? 'person' : 'people'} to follow
              </span>
            </div>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      )}
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
        `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  if (trendingTopics.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full">
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Trending topics
        </h2>
      </div>

      {/* Topics List */}
      <div className="p-4 space-y-3">
        {trendingTopics.map(({ hashtag, count }, index) => {
          const title = hashtag.split("#")[1];

          return (
            <Link 
              key={title} 
              href={`/hashtag/${title}`} 
              className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {index + 1} · Trending
                    </span>
                  </div>
                  <p
                    className="line-clamp-1 break-all font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
                    title={hashtag}
                  >
                    <Hash className="h-4 w-4 text-gray-400" />
                    {title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatNumber(count)} {count === 1 ? "post" : "posts"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Show More Link */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <Link 
          href="/explore/trending"
          className="flex items-center justify-between p-4 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 rounded-b-2xl group"
        >
          <span className="text-sm font-medium">Show more</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
}
