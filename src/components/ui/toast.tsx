"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg backdrop-blur-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-border bg-background/95 text-foreground shadow-md",
        success: 
          "border-green-200 bg-green-50/95 text-green-900 dark:border-green-800 dark:bg-green-950/95 dark:text-green-100",
        error: 
          "border-red-200 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/95 dark:text-red-100",
        warning: 
          "border-yellow-200 bg-yellow-50/95 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/95 dark:text-yellow-100",
        info: 
          "border-blue-200 bg-blue-50/95 text-blue-900 dark:border-blue-800 dark:bg-blue-950/95 dark:text-blue-100",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      duration={variant === "error" || variant === "destructive" ? 8000 : 5000}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "group-[.success]:border-green-300 group-[.success]:hover:bg-green-100 group-[.success]:dark:border-green-700 group-[.success]:dark:hover:bg-green-900",
      "group-[.error]:border-red-300 group-[.error]:hover:bg-red-100 group-[.error]:dark:border-red-700 group-[.error]:dark:hover:bg-red-900",
      "group-[.warning]:border-yellow-300 group-[.warning]:hover:bg-yellow-100 group-[.warning]:dark:border-yellow-700 group-[.warning]:dark:hover:bg-yellow-900",
      "group-[.info]:border-blue-300 group-[.info]:hover:bg-blue-100 group-[.info]:dark:border-blue-700 group-[.info]:dark:hover:bg-blue-900",
      "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      "group-[.success]:text-green-600 group-[.success]:hover:text-green-800 group-[.success]:focus:ring-green-400 group-[.success]:dark:text-green-400 group-[.success]:dark:hover:text-green-200",
      "group-[.error]:text-red-600 group-[.error]:hover:text-red-800 group-[.error]:focus:ring-red-400 group-[.error]:dark:text-red-400 group-[.error]:dark:hover:text-red-200",
      "group-[.warning]:text-yellow-600 group-[.warning]:hover:text-yellow-800 group-[.warning]:focus:ring-yellow-400 group-[.warning]:dark:text-yellow-400 group-[.warning]:dark:hover:text-yellow-200",
      "group-[.info]:text-blue-600 group-[.info]:hover:text-blue-800 group-[.info]:focus:ring-blue-400 group-[.info]:dark:text-blue-400 group-[.info]:dark:hover:text-blue-200",
      "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Enhanced Toast Icon Component
const ToastIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "error":
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      default:
        return <Info className="h-5 w-5 text-foreground/60" />
    }
  }

  return (
    <div
      ref={ref}
      className={cn("flex-shrink-0", className)}
      {...props}
    >
      {getIcon()}
    </div>
  )
})
ToastIcon.displayName = "ToastIcon"

// Enhanced Toast Content Wrapper
const ToastContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
    showIcon?: boolean
  }
>(({ className, variant = "default", showIcon = true, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start gap-3 flex-1", className)}
    {...props}
  >
    {showIcon && <ToastIcon variant={variant} />}
    <div className="flex-1 space-y-1">
      {children}
    </div>
  </div>
))
ToastContent.displayName = "ToastContent"

// Progress Bar Component for Toast Duration
const ToastProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "error" | "warning" | "info" | "destructive"
    duration?: number
  }
>(({ className, variant = "default", duration = 5000, ...props }, ref) => {
  const getProgressColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500"
      case "error":
      case "destructive":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <div
      ref={ref}
      className={cn("absolute bottom-0 left-0 h-1 w-full bg-black/10 dark:bg-white/10", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all ease-linear",
          getProgressColor()
        )}
        style={{
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />
    </div>
  )
})
ToastProgress.displayName = "ToastProgress"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ToastContent,
  ToastProgress,
}
