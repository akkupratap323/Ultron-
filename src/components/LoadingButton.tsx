import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  loadingText?: string;
  spinnerSize?: "sm" | "md" | "lg";
}

export default function LoadingButton({
  loading,
  disabled,
  className,
  loadingText,
  spinnerSize = "md",
  children,
  ...props
}: LoadingButtonProps) {
  const spinnerSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <Button
      disabled={loading || disabled}
      className={cn(
        "relative flex items-center justify-center gap-2 transition-all duration-200",
        loading && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 
          className={cn(
            "animate-spin text-current",
            spinnerSizes[spinnerSize]
          )} 
        />
      )}
      <span className={cn(
        "transition-opacity duration-200",
        loading && loadingText && "opacity-0"
      )}>
        {loading && loadingText ? loadingText : children}
      </span>
    </Button>
  );
}
