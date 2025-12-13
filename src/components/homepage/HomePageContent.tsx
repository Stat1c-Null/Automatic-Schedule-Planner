import React from "react";
import HomePageHeader from "./HomePageHeader";

interface HomePageContentProps {
  
}

export default function HomePageContent({
  
}: HomePageContentProps) {
  return (
    /*this div contains all of the content in HomePageContent, top margin to avoid NavBar overlapping*/
    <div className="pt-6 mt-16 bg-black">

    <HomePageHeader/>

    </div>
  );
}