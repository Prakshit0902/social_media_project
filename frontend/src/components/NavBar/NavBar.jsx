// NavBar.jsx
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full" />
      ),
      onClick: () => {
        navigate('/dashboard');
      }  
    },
    {
      title: "Explore",
      icon: (
        <IconSearch className="h-full w-full" />
      ),
      onClick: () => {
        navigate('/dashboard/explore');
      }  
    },
    {
      title: "Chat",
      icon: (
        <IconMessageCircle className="h-full w-full" />
      ),
      href: "#",
    },
    {
      title: "Create",
      icon: (
        <IconPlus className="h-full w-full" />
      ),
      href: "#",
    },
    {
      title: "Notifications",
      icon: (
        <IconBell className="h-full w-full" />
      ),
      href: "#",
    },
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full" />
      ),
      href: "#",
    },
    {
      title: "Logout",
      icon: (
        <IconLogout className="h-full w-full" />
      ),
      onClick: () => {
        dispatch(logoutUser());
      },
    },
  ];

  return <FloatingDock items={links} />;
}