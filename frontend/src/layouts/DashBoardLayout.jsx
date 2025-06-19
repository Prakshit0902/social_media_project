import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavBar } from "../components/NavBar/NavBar";
import { AuroraBackground } from "../components/ui/aurora-background";
import { motion } from "motion/react";
import { ExpandableCard } from "../components/UserSuggestionSidebar/ExpandableCard";

function DashBoardLayout() {
  const location = useLocation()
  const showExpandableCard = location.pathname === "/dashboard"
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="fixed inset-0 w-full h-full z-0">
              <AuroraBackground>
                <motion.div
                  initial={{ opacity: 0.0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                  }}
                  className="relative flex flex-col gap-4 items-center justify-center px-4"
                >

                </motion.div>
              </AuroraBackground>
            </div>
      {/* Main scrollable content area */}
      <main className="flex-1 pb-20 md:pb-24">
        <Outlet />
      </main>

      {showExpandableCard && <div className="fixed top-0 right-0 z-50" >
        <ExpandableCard />
      </div>}

      {/* Fixed navbar at bottom */}
      
        <NavBar />
    </div>
  );
}

export { DashBoardLayout }; 