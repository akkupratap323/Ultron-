import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
  loading?: boolean;
  hasMore?: boolean;
  loadingText?: string;
  endMessage?: string;
}

export default function InfiniteScrollContainer({
  children,
  onBottomReached,
  className,
  loading = false,
  hasMore = true,
  loadingText = "Loading more...",
  endMessage = "You've reached the end!",
}: InfiniteScrollContainerProps) {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView && hasMore && !loading) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={cn("space-y-4", className)}>
      {children}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {loadingText}
          </p>
        </div>
      )}

      {/* End Message */}
      {!hasMore && !loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent rounded-full" />
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {endMessage}
          </p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent rounded-full" />
        </div>
      )}

      {/* Intersection Observer Target */}
      <div ref={ref} className="h-1" />
    </div>
  );
}
