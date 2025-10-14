import React from "react";
import HoverButton from "./HoverButton";
import Link from "next/link";

interface NavBarProps {
  
}

export default function NavBar({
  
}: NavBarProps) {
  return (
    <div id="navbar" className="fixed top-0 left-0 w-full h-16 bg-gray-600 text-yellow-300 flex items-center justify-left px-4 gap-4">   
        <h1 className="text-2xl font-bold">Automatic Schedule Planner</h1>
        <Link href="/"><HoverButton text="Home"/></Link>
        <Link href="/schedule"><HoverButton text="Schedule"/></Link>
        <Link href="/"><HoverButton text="Tutorial"/></Link>



    </div>
  );
}