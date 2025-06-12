/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
**/
/**
 * Note: Use position fixed according to your needs
 * Desktop navbar is better positioned at the bottom
 * Mobile navbar is better positioned at bottom right.
**/
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";

import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
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
  let touchX = useMotionValue(Infinity);
  
  return (
    <motion.div
      onTouchMove={(e) => {
        const touch = e.touches[0];
        touchX.set(touch.clientX);
      }}
      onTouchEnd={() => touchX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:hidden dark:bg-neutral-900",
        className
      )}>
      {items.map((item) => (
        <IconContainerMobile touchX={touchX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainerMobile({
  touchX,
  title,
  icon,
  href,
  onClick
}) {
  let ref = useRef(null);
  const [tapped, setTapped] = useState(false);

  let distance = useTransform(touchX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
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
    <ComponentTag {...linkProps}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onTouchStart={() => setTapped(true)}
        onTouchEnd={() => setTimeout(() => setTapped(false), 200)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800">
        <AnimatePresence>
          {tapped && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white">
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>
    </ComponentTag>
  );
}

const FloatingDockDesktop = ({
  items,
  className
}) => {
  let mouseY = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "hidden h-screen w-16 flex-col items-center justify-around gap-6 bg-gray-50 py-8 px-3 md:flex dark:bg-neutral-900",
        className
      )}>
      {items.map((item) => (
        <IconContainer mouseY={mouseY} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseY,
  title,
  icon,
  href,
  onClick
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseY, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

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
    <ComponentTag {...linkProps}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800">
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: 2, y: "-50%" }}
              className="absolute -right-8 top-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white">
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center">
          {icon}
        </motion.div>
      </motion.div>
    </ComponentTag>
  );
}








// import { useRef, useState } from "react";
// import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";

// import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
// import { cn } from "../../lib/utils";

// export const FloatingDock = ({
//   items,
//   desktopClassName, 
//   mobileClassName
// }) => {
//   return (
//     <>
//       <FloatingDockDesktop items={items} className={desktopClassName} />
//       <FloatingDockMobile items={items} className={mobileClassName} />
//     </>
//   );
// };

// const FloatingDockMobile = ({
//   items,
//   className
// }) => {
//   let touchX = useMotionValue(Infinity);
  
//   return (
//     <motion.div
//       onTouchMove={(e) => {
//         const touch = e.touches[0];
//         touchX.set(touch.clientX);
//       }}
//       onTouchEnd={() => touchX.set(Infinity)}
//       className={cn(
//         "mx-auto flex h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:hidden dark:bg-neutral-900",
//         className
//       )}>
//       {items.map((item) => (
//         <IconContainerMobile touchX={touchX} key={item.title} {...item} />
//       ))}
//     </motion.div>
//   );
// };

// function IconContainerMobile({
//   touchX,
//   title,
//   icon,
//   href,
//   onClick
// }) {
//   let ref = useRef(null);
//   const [tapped, setTapped] = useState(false);

//   let distance = useTransform(touchX, (val) => {
//     let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
//     return val - bounds.x - bounds.width / 2;
//   });

//   let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
//   let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

//   let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
//   let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

//   let width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   let height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   let widthIcon = useSpring(widthTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   let heightIcon = useSpring(heightTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   const handleClick = (e) => {
//     if (onClick) {
//       e.preventDefault();
//       onClick(e);
//     }
//   };

//   const ComponentTag = onClick ? 'button' : 'a';
//   const linkProps = onClick 
//     ? { onClick: handleClick, type: 'button' }
//     : { href: href || '#' };

//   return (
//     <ComponentTag {...linkProps}>
//       <motion.div
//         ref={ref}
//         style={{ width, height }}
//         onTouchStart={() => setTapped(true)}
//         onTouchEnd={() => setTimeout(() => setTapped(false), 200)}
//         className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800">
//         <AnimatePresence>
//           {tapped && (
//             <motion.div
//               initial={{ opacity: 0, y: 10, x: "-50%" }}
//               animate={{ opacity: 1, y: 0, x: "-50%" }}
//               exit={{ opacity: 0, y: 2, x: "-50%" }}
//               className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white">
//               {title}
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <motion.div
//           style={{ width: widthIcon, height: heightIcon }}
//           className="flex items-center justify-center">
//           {icon}
//         </motion.div>
//       </motion.div>
//     </ComponentTag>
//   );
// }

// const FloatingDockDesktop = ({
//   items,
//   className
// }) => {
//   let mouseX = useMotionValue(Infinity);
//   return (
//     <motion.div
//       onMouseMove={(e) => mouseX.set(e.pageX)}
//       onMouseLeave={() => mouseX.set(Infinity)}
//       className={cn(
//         "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
//         className
//       )}>
//       {items.map((item) => (
//         <IconContainer mouseX={mouseX} key={item.title} {...item} />
//       ))}
//     </motion.div>
//   );
// };

// function IconContainer({
//   mouseX,
//   title,
//   icon,
//   href,
//   onClick
// }) {
//   let ref = useRef(null);

//   let distance = useTransform(mouseX, (val) => {
//     let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

//     return val - bounds.x - bounds.width / 2;
//   });

//   let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
//   let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

//   let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
//   let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

//   let width = useSpring(widthTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   let height = useSpring(heightTransform, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   let widthIcon = useSpring(widthTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });
//   let heightIcon = useSpring(heightTransformIcon, {
//     mass: 0.1,
//     stiffness: 150,
//     damping: 12,
//   });

//   const [hovered, setHovered] = useState(false);

//   const handleClick = (e) => {
//     if (onClick) {
//       e.preventDefault();
//       onClick(e);
//     }
//   };

//   const ComponentTag = onClick ? 'button' : 'a';
//   const linkProps = onClick 
//     ? { onClick: handleClick, type: 'button' }
//     : { href: href || '#' };

//   return (
//     <ComponentTag {...linkProps}>
//       <motion.div
//         ref={ref}
//         style={{ width, height }}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//         className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-800">
//         <AnimatePresence>
//           {hovered && (
//             <motion.div
//               initial={{ opacity: 0, y: 10, x: "-50%" }}
//               animate={{ opacity: 1, y: 0, x: "-50%" }}
//               exit={{ opacity: 0, y: 2, x: "-50%" }}
//               className="absolute -top-8 left-1/2 w-fit rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs whitespace-pre text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-white">
//               {title}
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <motion.div
//           style={{ width: widthIcon, height: heightIcon }}
//           className="flex items-center justify-center">
//           {icon}
//         </motion.div>
//       </motion.div>
//     </ComponentTag>
//   );
// }

