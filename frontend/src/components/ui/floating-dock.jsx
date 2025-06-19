// floating-dock.jsx
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

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
      "fixed bottom-0 left-0 right-0 mx-auto flex h-16 items-center justify-around bg-white/80 backdrop-blur-md px-4 md:hidden dark:bg-neutral-900/80 border-t border-gray-200 dark:border-neutral-800",
      className
    )}>
      {items.map((item) => (
        <MobileNavItem key={item.title} {...item} />
      ))}
    </div>
  );
};

function MobileNavItem({ title, icon, href, onClick }) {
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
      className="flex flex-col items-center gap-1 p-2 rounded-lg active:scale-95 transition-transform"
    >
      <div className="w-6 h-6 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
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
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex fixed left-0 top-0 h-screen flex-col bg-white/80 backdrop-blur-md border-r border-gray-200 dark:bg-neutral-900/80 dark:border-neutral-800",
        className
      )}
    >
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800">
        <motion.h1 
          className="font-bold text-xl text-neutral-800 dark:text-white overflow-hidden whitespace-nowrap"
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          YourApp
        </motion.h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3">
        <div className="flex flex-col gap-2">
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
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
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
            className="text-neutral-600 dark:text-neutral-400"
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

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let scale = useTransform(distance, [-150, 0, 150], [0.9, 1.1, 0.9]);
  let scaleSpring = useSpring(scale, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

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
    <ComponentTag {...linkProps} className="block">
      <motion.div
        ref={ref}
        style={{ scale: isHovered ? scaleSpring : 1 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          "hover:bg-gray-100 dark:hover:bg-neutral-800",
          "group"
        )}
      >
        {/* Icon Container */}
        <motion.div 
          className="relative flex items-center justify-center"
          animate={{ width: isExpanded ? 24 : 40, height: isExpanded ? 24 : 40 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex items-center justify-center text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
            animate={{ scale: isExpanded ? 1 : 1.2 }}
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
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors whitespace-nowrap"
            >
              {title}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Hover Indicator */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 3 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 bg-blue-500 rounded-r-full"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ComponentTag>
  );
}