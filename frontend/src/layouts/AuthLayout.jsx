// src/components/Layout/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Vortex } from "../components/ui/vortex";

export default function AuthLayout() {
  return (
<div
      className="w-full h-screen overflow-hidden">
      <Vortex
        backgroundColor="black"
        rangeY={800}
        particleCount={500}
        baseHue={120}
        className="flex items-center flex-col sm:flex-row justify-around w-full h-full gap-12 px-6">
        <div className="flex items-center flex-col justify-center">
          <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
            Welcome!
          </h2>
          <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
            Connect. Create. Be Seen — Your World, Your Vibe.
          </p>
        </div>
        <div className="flex-col items-center md:w-lg ">
            <Outlet />
        </div>

      </Vortex>
    </div>
  );
}
