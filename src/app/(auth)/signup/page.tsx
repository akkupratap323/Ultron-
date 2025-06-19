import signupImage from "@/assets/signup-image.jpg";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bot, Sparkles, Users, Zap, CheckCircle, ArrowRight } from "lucide-react";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up - Ultron",
  description: "Join millions of users on Ultron's AI-powered video calling platform"
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      
      <div className="relative flex h-full max-h-[44rem] w-full max-w-[70rem] overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-800/50">
        
        {/* Left Panel - Signup Form */}
        <div className="w-full space-y-8 overflow-y-auto p-8 md:w-1/2 lg:p-12">
          
          {/* Header with Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                Join Ultron Today
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-sm mx-auto">
                Connect with friends, family, and colleagues through AI-enhanced video calls and messaging
              </p>
            </div>
          </div>

          {/* Benefits Section */}
        

          {/* Signup Form */}
          <div className="space-y-6">
            <SignUpForm />
            
            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 hover:underline inline-flex items-center gap-1"
                >
                  Sign in here
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Join users worldwide • No credit card required
            </span>
          </div>
        </div>

        {/* Right Panel - Hero Section */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          
          {/* Background Image */}
          <Image
            src={signupImage}
            alt="Ultron Video Calling Community"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-blue-600/80 to-indigo-600/90"></div>
          
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-center p-12 text-white">
            
            {/* Floating Elements */}
            <div className="absolute top-8 right-8 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Users className="w-6 h-6 text-white" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold leading-tight">
                  Where connections come alive
                </h2>
                <p className="text-purple-100 text-lg leading-relaxed">
                  Experience the future of communication with crystal-clear video calls, intelligent features, and seamless collaboration tools.
                </p>
              </div>

              {/* Social Proof */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white backdrop-blur-sm"></div>
                    <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white backdrop-blur-sm"></div>
                    <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white backdrop-blur-sm"></div>
                    <div className="w-8 h-8 bg-white/20 rounded-full border-2 border-white backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                      +
                    </div>
                  </div>
                  <span className="text-purple-100 font-medium">Join millions of happy users</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-100 text-sm">HD video calls with up to 100 participants</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-100 text-sm">AI-powered noise cancellation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-purple-100 text-sm">Cross-platform compatibility</span>
                </div>
              </div>

              {/* CTA Quote */}
              <div className="pt-8 border-t border-white/20">
                <blockquote className="text-purple-100 italic text-sm">
                  &ldquo;Ultron has revolutionized how our team collaborates. The AI features are incredible!&rdquo;
                </blockquote>
                <cite className="text-purple-200 text-xs font-medium mt-2 block">
                  — Aditya
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
