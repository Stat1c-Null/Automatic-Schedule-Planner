import React from "react";

interface HomePageHeaderProps {
  
}

export default function HomePageHeader({
  
}: HomePageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-2">

    {/*creates background for content, welcome message*/}  
    <div className="margins colors pt-5">
      <h2 className="text-5xl" >Create your schedule in minutes</h2>
      <br></br>
      <p className="text-3xl">Create your optimal schedule in minutes instead of hours using our tool.</p>
    </div>

    </div>
  );
}