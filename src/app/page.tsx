"use client";
import React from "react";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HomePageContent from "@/components/HomePageContent";
import Footer from "@/components/Footer";

export default function HomePage() {
  useEffect(() => {
      document.title = "Home";
    });

  return (
    <main className='bg-black'>
      <NavBar/>

      <HomePageContent/>

      <Footer/>
    </main>
  );
}