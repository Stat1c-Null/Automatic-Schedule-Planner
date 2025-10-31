import React from "react";
import NavBar from "@/components/NavBar";
import HomePageContent from "@/components/HomePageContent";


export default function HomePage() {
  return (
    <main className='bg-black'>
      <NavBar/>

      <HomePageContent/>
    </main>
  );
}