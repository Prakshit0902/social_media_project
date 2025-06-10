// src/components/Layout/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Vortex } from "../components/ui/vortex";

// export default function AuthLayout() {
//   return (
// <div
//       className="w-full fixed inset-0 overflow-hidden">
//       <Vortex
//         backgroundColor="black"
//         rangeY={800}
//         particleCount={500}
//         baseHue={120}
//         className="flex items-center flex-col sm:flex-row justify-around w-full h-full gap-12 px-6">
//         <div className="flex items-center flex-col justify-center">
//           <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
//             Welcome!
//           </h2>
//           <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
//             Connect. Create. Be Seen — Your World, Your Vibe.
//           </p>
//         </div>
//         <div className="flex-col items-center md:w-lg ">
//             <Outlet />
//         </div>

//       </Vortex>
//     </div>
//   );
// }

export default function AuthLayout() {
  return (
    <>
      {/* Fixed background that stays in place during scroll */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Vortex
          backgroundColor="black"
          rangeY={800}
          particleCount={500}
          baseHue={120}
        />
      </div>
      
      {/* Main scrollable container */}
      <div className="relative z-10 w-full min-h-screen overflow-y-auto">
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col items-center w-full gap-12 md:flex-row md:justify-around">
            <div className="flex items-center flex-col justify-center my-6">
              <h2 className="text-white text-2xl md:text-6xl font-bold text-center">
                Welcome!
              </h2>
              <p className="text-white text-sm md:text-2xl max-w-xl mt-6 text-center">
                Connect. Create. Be Seen — Your World, Your Vibe.
              </p>
            </div>
            <div className="flex-col items-center md:w-lg mb-12">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}