import React from "react";

import {
  IconBell,
  IconCircleDashed,
  IconCircleDotted,
  IconExchange,
  IconHome,
  IconMessageCircle,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconStack,
  IconUser,
} from "@tabler/icons-react";
import { FloatingDock } from "../ui/floating-dock";

export function NavBar() {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard",  
    },

    {
      title: "Explore",
      icon: (
        <IconSearch className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard/explore",
    },
    {
      title: "Chat",
      icon: (
        <IconMessageCircle className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Create",
      icon: (
        <IconPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Stories",
      icon: (
        <IconCircleDotted className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },

    {
      title: "Notifications",
      icon: (
        <IconBell className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
  ];
  return (
      <div className="flex justify-center w-full">  
      <FloatingDock
        desktopClassName="mx-auto w-fit"
        mobileClassName="w-full"
        items={links} />
    </div>
  );
}
