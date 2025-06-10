"use client";
import { cn } from "../../lib/utils";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-gray-50 text-slate-950 dark:bg-gray-950",
          className
        )}
        {...props}>
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              // Subtle, modern gradient for social media
              "--aurora":
                "linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #4facfe 60%, #00d2ff 80%, #667eea 100%)",

              // Softer dark gradient
              "--dark-gradient":
                "linear-gradient(125deg, #0f0f0f 0%, #1a1a1a 25%, transparent 40%, transparent 60%, #1a1a1a 75%, #0f0f0f 100%)",

              // Softer white gradient
              "--white-gradient":
                "linear-gradient(125deg, #ffffff 0%, #f8fafc 25%, transparent 40%, transparent 60%, #f8fafc 75%, #ffffff 100%)",

              // Social media friendly color palette
              "--purple-400": "#a78bfa",
              "--purple-500": "#8b5cf6",
              "--pink-400": "#f472b6",
              "--blue-400": "#60a5fa",
              "--blue-500": "#3b82f6",
              "--teal-400": "#2dd4bf",
              "--indigo-400": "#818cf8",
              
              // Base colors
              "--black": "#0f0f0f",
              "--white": "#ffffff",
              "--transparent": "transparent"
            }
          }>
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-30 blur-[60px] filter will-change-transform`,
              
              // Light mode - subtle pastel aurora
              `[background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%]`,
              
              // Aurora gradient using CSS variables
              `[--aurora:linear-gradient(135deg,var(--purple-400)_0%,var(--pink-400)_20%,var(--blue-400)_40%,var(--teal-400)_60%,var(--indigo-400)_80%,var(--purple-400)_100%)]`,
              
              // Gradient definitions
              `[--dark-gradient:linear-gradient(125deg,var(--black)_0%,var(--black)_25%,var(--transparent)_40%,var(--transparent)_60%,var(--black)_75%,var(--black)_100%)]`,
              `[--white-gradient:linear-gradient(125deg,var(--white)_0%,var(--white)_25%,var(--transparent)_40%,var(--transparent)_60%,var(--white)_75%,var(--white)_100%)]`,
              
              // After pseudo element
              `after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-soft-light after:content-[""]`,
              
              // Dark mode adjustments
              `dark:[background-image:var(--dark-gradient),var(--aurora)] dark:opacity-20 dark:invert-0`,
              `after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
              
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_50%_0%,black_40%,transparent_100%)]`
            )}></div>
        </div>
        {children}
      </div>
    </main>
  );
};