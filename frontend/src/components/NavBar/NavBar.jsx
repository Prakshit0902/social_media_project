import React from "react";

import {
  IconBell,
  IconHome,
  IconLogout,
  IconMessageCircle,
  IconPlus,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { FloatingDock } from "../ui/floating-dock";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../store/slices/authSlice";


export function NavBar() {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick : () => {
        navigate('/dashboard')
      }  
    },

    {
      title: "Explore",
      icon: (
        <IconSearch className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      // href: "/dashboard/explore",
      onClick : () => {
        navigate('/dashboard/explore')
      }  
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
    {
      title: "Logout",
      icon: (
        <IconLogout className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => {
        dispatch(logoutUser())
      },
    },
  ];
  return (
    <>

        <div className="flex justify-center w-full">  
        <FloatingDock
          desktopClassName="mx-auto w-fit"
          mobileClassName="mx-0 w-fit"
          items={links} />
      </div>
    </>
  );
}
