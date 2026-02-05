// floating-dock.jsx
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { IconSparkles } from "@tabler/icons-react";

export const FloatingDock = ({
  items,
  desktopClassName, 
  mobileClassName
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className
}) => {
  return (
    <div className={cn(
      "z-50 fixed bottom-0 left-0 right-0 mx-auto flex h-16 items-center justify-around bg-neutral-900/90 backdrop-blur-xl px-4 md:hidden border-t border-white/5",
      className
    )}>
      {items.map((item) => (
        <MobileNavItem key={item.title} {...item} />
      ))}
    </div>
  );
};

function MobileNavItem({ title, icon, href, onClick }) {
  const [isActive, setIsActive] = useState(false);
  
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  const ComponentTag = onClick ? 'button' : 'a';
  const linkProps = onClick 
    ? { onClick: handleClick, type: 'button' }
    : { href: href || '#' };

  return (
    <ComponentTag 
      {...linkProps}
      className="flex flex-col items-center gap-1 p-2 rounded-xl active:scale-95 transition-all group"
    >
      <div className="w-6 h-6 text-neutral-400 group-hover:text-emerald-400 group-active:text-emerald-500 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300 transition-colors">
        {title}
      </span>
    </ComponentTag>
  );
}

const FloatingDockDesktop = ({
  items,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  let mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.clientY)}
      onMouseLeave={() => mouseX.set(Infinity)}
      animate={{ width: isExpanded ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "z-50 hidden md:flex fixed left-0 top-0 h-screen flex-col bg-neutral-900/80 backdrop-blur-xl border-r border-white/5",
        className
      )}
    >
      {/* Logo/Brand Section */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <IconSparkles className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"
              >
                Synapse
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <SidebarItem 
              key={item.title} 
              mouseX={mouseX} 
              isExpanded={isExpanded}
              {...item} 
            />
          ))}
        </div>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-neutral-800 rounded-full border border-white/10 flex items-center justify-center shadow-lg hover:bg-neutral-700 transition-colors group"
      >
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path
            d="M4 2L8 6L4 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-400 group-hover:text-emerald-400 transition-colors"
          />
        </motion.svg>
      </button>
    </motion.div>
  );
};

function SidebarItem({
  mouseX,
  title,
  icon,
  href,
  onClick,
  isExpanded
}) {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  const ComponentTag = onClick ? 'button' : 'a';
  const linkProps = onClick 
    ? { onClick: handleClick, type: 'button' }
    : { href: href || '#' };

  return (
    <ComponentTag {...linkProps} className="block w-full">
      <motion.div
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
          "hover:bg-white/5",
          "group"
        )}
      >
        {/* Active/Hover indicator */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
            />
          )}
        </AnimatePresence>

        {/* Icon Container */}
        <motion.div 
          className="relative flex items-center justify-center z-10"
          animate={{ width: isExpanded ? 24 : 32, height: isExpanded ? 24 : 32 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={cn(
              "flex items-center justify-center transition-colors duration-200",
              "text-neutral-400 group-hover:text-emerald-400"
            )}
            animate={{ scale: isExpanded ? 1 : 1.1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        </motion.div>

        {/* Title */}
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 text-sm font-medium text-neutral-400 group-hover:text-white transition-colors whitespace-nowrap"
            >
              {title}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </ComponentTag>
  );
}