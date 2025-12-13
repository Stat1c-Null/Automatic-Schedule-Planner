"use client";
import React from "react";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HomePageContent from "@/components/homepage/HomePageContent";
import Footer from "@/components/Footer";
import HomePageHeader from "@/components/homepage/HomePageHeader";

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