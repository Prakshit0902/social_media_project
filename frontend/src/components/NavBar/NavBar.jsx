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
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, resetAuthState } from "../../store/slices/authSlice";
import { resetExplorePage, resetFeedPage } from "../../store/slices/feedSlice";
import { persistor } from "../../store/store";
import { getUserProfile, resetUserState } from "../../store/slices/userSlice";
import { resetPostState } from "../../store/slices/postSlice";

export function NavBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {user} = useSelector((state) => state.auth)

  const handleLogOut = async () => {
    try {
          dispatch(logoutUser())
          dispatch(resetExplorePage())
          dispatch(resetFeedPage())
          dispatch(resetAuthState())
          dispatch(resetUserState())
          dispatch(resetPostState())

          await persistor.purge()
          navigate('/')
        } catch (error) {
            console.error('Logout failed:', error)
          
        }
  }

  const handleProfile = () => {
    if (!user){
      console.log('no user found');
    }

    if (user?.data?._id){
      console.log(user.data)
      
      navigate(`/dashboard/profile/${user.data._id}`)
    }
  }

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
      onClick : handleProfile
    },
    {
      title: "Logout",
      icon: (
        <IconLogout className="h-full w-full" />
      ),
      onClick: handleLogOut,
    },
  ];

  return <FloatingDock items={links} />;
}