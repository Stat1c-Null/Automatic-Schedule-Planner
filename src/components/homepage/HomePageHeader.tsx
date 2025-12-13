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

        {/*grid of features*/}
        <div className="flex flex-wrap gap-2">

            <div className="">
                <span>KSU Course Catalog Integration</span>
                <p>This app integrates with KSU's course catalog to provide lists of available classes given your desired schedule. Instead of searching manually, simply enter your classes and have our app do the work for you.</p>
            </div>

            <div className="">
                <span>Rate my Professor Integration</span>
                <p>This app integrates with Rate my Professor to easily select the top rated professors for your courses.</p>
            </div>




        </div>


    </div>
    
    <br></br>

    {/*About section*/}
    <div className="margins colors">

    </div>




    </div>
  );
}