import React from "react";

interface HomePageHeaderProps {
  
}

export default function HomePageHeader({
  
}: HomePageHeaderProps) {
  return (
    <div className="relative flex flex-col gap-2">

    {/*creates background for content, welcome message*/}  
    <div className="margins colors">
      <h2 className="text-6xl" >Schedule in minutes</h2>
      <br></br>
      <p className="text-3xl">Create your schedules in minutes instead of hours using our tool.</p>

    </div>
    
    <br></br>

    {/*About section*/}
    <div className="margins colors">

    </div>




    </div>
  );
}