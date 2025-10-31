import React from "react";

interface HomePageContentProps {
  
}

export default function HomePageContent({
  
}: HomePageContentProps) {
  return (
    /*this div contains all of the content in HomePageContent, top margin to avoid NavBar overlapping*/
    <div className="pt-6 mt-16 bg-black">
    {/*creates background for content, welcome message*/}  
    <div className="mx-4 bg-gray-800 text-yellow-300 rounded-sm px-8">
      <h2 className="text-6xl" >Welcome!</h2>
      <br></br>
      <p className="text-xl">To get started, select the "Schedule" button on the top of the screen. To learn how to use, press the "Tutorial" button.</p>
    </div>
    
    <br></br>
    {/*About section*/}
    <div className="mx-4 bg-gray-800 text-yellow-300 rounded-sm px-8">
      <h2 className="text-6xl" >About this page</h2>
      <p className="text-xl">This website will automatically generate schedules based on Rate My Professor ratings and the required classes in a degree.</p>
      

    </div>





    </div>
  );
}