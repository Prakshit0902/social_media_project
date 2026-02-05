// src/components/Layout/AuthLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Vortex } from "../components/ui/vortex";
import { motion } from "motion/react";
import { 
  IconUsers, 
  IconMessageCircle, 
  IconPhoto, 
  IconHeart,
  IconSparkles,
  IconShield
} from "@tabler/icons-react";

const features = [
  {
    icon: IconUsers,
    title: "Connect",
    description: "Build meaningful connections with people who share your interests"
  },
  {
    icon: IconMessageCircle,
    title: "Chat",
    description: "Real-time messaging with friends and communities"
  },
  {
    icon: IconPhoto,
    title: "Share",
    description: "Share your moments with stunning photos and videos"
  },
  {
    icon: IconHeart,
    title: "Engage",
    description: "Like, comment, and interact with content you love"
  },
  {
    icon: IconSparkles,
    title: "AI Powered",
    description: "Smart recommendations and AI-assisted features"
  },
  {
    icon: IconShield,
    title: "Secure",
    description: "Your privacy and security are our top priority"
  }
];

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index, duration: 0.5 }}
    className="group relative p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
        <Icon className="w-5 h-5 text-emerald-400" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-neutral-400 text-xs mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default function AuthLayout() {
  const location = useLocation();
  const isRegisterPage = location.pathname === "/register";
  const isCompleteProfile = location.pathname === "/complete-profile";

  return (
    <>
      {/* Fixed animated background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Vortex
          backgroundColor="black"
          rangeY={800}
          particleCount={500}
          baseHue={160}
          className="opacity-60"
        />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-emerald-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Main scrollable container */}
      <div className="relative z-10 w-full min-h-screen overflow-y-auto">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          
          {/* Header with logo */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 lg:mb-0 lg:absolute lg:top-8 lg:left-8"
          >
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <IconSparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Synapse
              </span>
            </div>
          </motion.header>

          {/* Main content grid */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 min-h-[calc(100vh-120px)]">
            
            {/* Left side - Hero content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 max-w-xl text-center lg:text-left"
            >
              {/* Main headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {isCompleteProfile ? (
                  <>
                    Complete Your{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      Profile
                    </span>
                  </>
                ) : (
                  <>
                    Connect. Create.{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                      Be Seen.
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-neutral-300 text-lg md:text-xl mb-8 leading-relaxed">
                {isCompleteProfile 
                  ? "Just a few more details to personalize your experience and connect with your community."
                  : "Join millions of creators and connect with people who share your passion. Your story deserves to be heard."
                }
              </p>

              {/* Stats section - hide on complete-profile */}
              {!isCompleteProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center lg:justify-start gap-8 mb-10"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">10M+</div>
                    <div className="text-neutral-400 text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">50M+</div>
                    <div className="text-neutral-400 text-sm">Posts Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">100+</div>
                    <div className="text-neutral-400 text-sm">Countries</div>
                  </div>
                </motion.div>
              )}

              {/* Feature grid - hide on register and complete-profile for cleaner look */}
              {!isRegisterPage && !isCompleteProfile && (
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {features.slice(0, 4).map((feature, index) => (
                    <FeatureCard key={feature.title} {...feature} index={index} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right side - Auth form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <div className="relative">
                {/* Glow effect behind form */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-60" />
                
                {/* Form container */}
                <div className="relative">
                  <Outlet />
                </div>
              </div>

              {/* Trust badges - only on login page */}
              {!isRegisterPage && !isCompleteProfile && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex items-center justify-center gap-6 text-neutral-500 text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <IconShield className="w-4 h-4" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconSparkles className="w-4 h-4" />
                    <span>AI Powered</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Mobile features - show only on login page */}
          {!isRegisterPage && !isCompleteProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:hidden mt-12 grid grid-cols-2 gap-3"
            >
              {features.slice(0, 4).map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </motion.div>
          )}

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-neutral-500 text-sm"
          >
            <p>© 2026 Synapse. All rights reserved.</p>
          </motion.footer>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
}