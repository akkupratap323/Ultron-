import { cn } from "@/lib/utils";
import { Eye, EyeOff, Lock } from "lucide-react";
import React, { useState } from "react";
import { Input, InputProps } from "./ui/input";

interface PasswordInputProps extends InputProps {
  showStrengthIndicator?: boolean;
  strengthLevel?: "weak" | "medium" | "strong";
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    className, 
    type, 
    showStrengthIndicator = false,
    strengthLevel = "weak",
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const getStrengthColor = (level: string) => {
      switch (level) {
        case "weak": return "bg-red-500";
        case "medium": return "bg-yellow-500";
        case "strong": return "bg-green-500";
        default: return "bg-gray-300";
      }
    };

    const getStrengthWidth = (level: string) => {
      switch (level) {
        case "weak": return "w-1/3";
        case "medium": return "w-2/3";
        case "strong": return "w-full";
        default: return "w-0";
      }
    };

    return (
      <div className="space-y-2">
        <div className="relative">
          {/* Password Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Lock className="h-4 w-4" />
          </div>

          <Input
            type={showPassword ? "text" : "password"}
            className={cn(
              "pl-10 pr-12 transition-all duration-200",
              isFocused && "ring-2 ring-blue-500/20 border-blue-500",
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all duration-200",
              "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            )}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {showStrengthIndicator && (
          <div className="space-y-1">
            <div className="flex gap-1">
              <div className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                strengthLevel === "weak" || strengthLevel === "medium" || strengthLevel === "strong" 
                  ? "bg-red-500" 
                  : "bg-gray-200 dark:bg-gray-700"
              )} />
              <div className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                strengthLevel === "medium" || strengthLevel === "strong" 
                  ? "bg-yellow-500" 
                  : "bg-gray-200 dark:bg-gray-700"
              )} />
              <div className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                strengthLevel === "strong" 
                  ? "bg-green-500" 
                  : "bg-gray-200 dark:bg-gray-700"
              )} />
            </div>
            <p className={cn(
              "text-xs font-medium transition-colors duration-200",
              strengthLevel === "weak" && "text-red-600 dark:text-red-400",
              strengthLevel === "medium" && "text-yellow-600 dark:text-yellow-400",
              strengthLevel === "strong" && "text-green-600 dark:text-green-400"
            )}>
              Password strength: {strengthLevel}
            </p>
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
