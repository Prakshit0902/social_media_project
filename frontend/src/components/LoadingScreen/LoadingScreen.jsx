// LoadingScreen.jsx
import { IconSparkles } from "@tabler/icons-react";

export const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="w-full h-screen flex items-center justify-center bg-neutral-950">
    {/* Background gradients */}
    <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-cyan-950/20" />
    
    <div className="relative z-10 text-center">
      {/* Animated logo */}
      <div className="relative mb-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center animate-pulse">
          <IconSparkles className="w-8 h-8 text-white" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 blur-xl opacity-50 animate-pulse" />
      </div>
      
      {/* Spinner */}
      <div className="relative w-12 h-12 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
      </div>
      
      {/* Message */}
      <p className="text-neutral-400 text-sm font-medium">{message}</p>
    </div>
  </div>
);