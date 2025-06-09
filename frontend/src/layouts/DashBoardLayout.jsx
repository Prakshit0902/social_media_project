import React from "react";
import { NavBar } from "../components/NavBar/NavBar";
// import { Home } from "../components/DashBoard/Home";

function DashBoardLayout({children}) {

    return (
    <div className="min-h-screen">
      {/* Main content area with padding bottom to account for navbar */}
      <main className="pb-24 md:pb-28">
        {children}
      </main>
      
      {/* Fixed navbar */}
      <NavBar />
    </div>
    )
}

export {DashBoardLayout}