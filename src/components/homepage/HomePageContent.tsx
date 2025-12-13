import React from "react";
import HomePageHeader from "./HomePageHeader";
import HoverButton from "@/components/HoverButton";
import Link from "next/link";

interface HomePageContentProps {
  
}

export default function HomePageContent({
  
}: HomePageContentProps) {
  return (
    /*this div contains all of the content in HomePageContent, top margin to avoid NavBar overlapping*/
    <div className="pt-6 mt-16 bg-black">

    <HomePageHeader/>

        {/*creates background for content, welcome message*/}
        <div className="margins colors p-5">
            {/*grid of features*/}
            <div className="flex flex-wrap gap-2">

                <div className="w-[calc(33.333%-0.75rem)] rounded-2xl border p-5">
                    <span className="block text-xl font-semibold">KSU Course Catalog Integration</span>
                    <p>This app integrates with KSU's course catalog to provide lists of available classes given your desired schedule. Instead of searching manually, simply enter your classes and have our app do the work for you.</p>
                </div>

                <div className="w-[calc(33.333%-0.75rem)] rounded-2xl border p-5">
                    <span className="block text-xl font-semibold">Rate my Professor Integration</span>
                    <p>This app integrates with Rate my Professor to easily select the top rated professors for your courses.</p>
                </div>

                <div className="w-[calc(33.333%-0.75rem)] rounded-2xl border p-5">
                    <span className="block text-xl font-semibold">Conflict Avoidance</span>
                    <p>Are you working part time, an athlete, or have other obligations? Enter any events that could lead to schedule conflicts and allow our app to handle them.</p>
                </div>
            </div>
        </div>

        {/*getting started*/}
        <div className="flex flex-wrap gap-2 margins colors p-5">
            <span className="block text-3xl font-semibold">Getting Started</span>
            <div className="flex flex-wrap gap-2">
                <Link href="/schedule"><HoverButton text="Schedule"/></Link>
                <Link href="/tutorial"><HoverButton text="Tutorial"/></Link>

            </div>



        </div>

    </div>
  );
}