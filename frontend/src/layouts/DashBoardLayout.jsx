import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../components/NavBar/NavBar";

function DashBoardLayout() {
  const location = useLocation()
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-cyan-950/10" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Main scrollable content area */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Fixed navbar */}
      <NavBar />
    </div>
  );
}

export { DashBoardLayout }; 