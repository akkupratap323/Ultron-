import loginImage from "@/assets/login-image.jpg";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bot, Sparkles, Shield, Users } from "lucide-react";
import GoogleSignInButton from "./google/GoogleSignInButton";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login - Ultron",
  description: "Sign in to your Ultron account for secure video calling and messaging"
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      
      <div className="relative flex h-full max-h-[42rem] w-full max-w-[68rem] overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-800/50">
        
        {/* Left Panel - Login Form */}
        <div className="w-full space-y-8 overflow-y-auto p-8 md:w-1/2 lg:p-12">
          
          {/* Header with Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                Sign in to continue your Ultron experience
              </p>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="space-y-6">
            
            {/* Google Sign In */}
            <div className="relative">
              <GoogleSignInButton />
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400 font-medium">
                  Or continue with email
                </span>
              </div>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/signup" 
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Secured with end-to-end encryption
            </span>
          </div>
        </div>

        {/* Right Panel - Hero Section */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          
          {/* Background Image */}
          <Image
            src={loginImage}
            alt="Ultron Video Calling Platform"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/80 to-indigo-600/90"></div>
          
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            
            {/* Floating Elements */}
            <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold leading-tight">
                  Connect with anyone, anywhere
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Experience crystal-clear video calls, instant messaging, and seamless collaboration with Ultron&apos;s AI-powered platform.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-100 font-medium">AI-Enhanced Video Calls</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-100 font-medium">Real-time Collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-blue-100 font-medium">Enterprise Security</span>
                </div>
              </div>
          
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
