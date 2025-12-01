import React from "react";
import HoverButton from "./HoverButton";
import Link from "next/link";

interface NavBarProps {
  
}

export default function NavBar(
  {
    
  }: NavBarProps) {
  return (
    <div id="navbar" className="fixed top-0 left-0 w-full h-16 bg-gray-800 text-yellow-300 flex items-center justify-between px-4 gap-4 z-[9999] shadow-md">   
        <div className="">
          <h1 className="text-2xl font-bold">Automatic Schedule Planner</h1>
        </div>
        
        <div className="flex items-center px-4 gap-4 z-[9999] shadow-md">
          <Link href="/"><HoverButton text="Home"/></Link>
          <Link href="/schedule"><HoverButton text="Schedule"/></Link>
          <Link href="/"><HoverButton text="Tutorial"/></Link>
        </div>
        
    </div>
  );
}