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

        {/*creates background for content, welcome message*/}
        <div className="margins colors">
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

    </div>
  );
}