"use client";
import React from "react";
import { useEffect} from "react";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function TutorialPage() {
    useEffect(() => {
        document.title = "Home";
    });

    return (
        <main className='bg-black'>
            <NavBar/>

            {/*container for content*/}
            <div className="pt-6 mt-16 bg-black">
                <div className="margins colors p-5">
                    <span className="text-3xl w-full mb-6">How to use</span>
                    <br></br>
                    <span className="text-xl w-full">First, enter all "Events". This will be all other activities such as work or clubs that interfere with scheduling.</span>
                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/addevent.png"
                            alt="single time event"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>
                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/addedevent.png"
                            alt="add event result"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>


                    <span className="text-xl w-full">To add events on multiple days or times, press the "+" button.</span>
                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/multipledays.png"
                            alt="multi time event"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>
                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/addedmultidayevent.png"
                            alt="add multi time event result"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>

                    <span className="text-xl w-full">Next, add the classes you need to take and press the "Add Class" and "Refresh" button.</span>
                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/addclass.png"
                            alt="add class"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>

                    <div className="relative h-40 w-full">
                        <Image
                            src="/assets/addclassresult.png"
                            alt="add class result"
                            fill
                            className="object-contain rounded-xl"
                            sizes="100vw"
                        />
                    </div>

                </div>

            </div>

            <Footer/>
        </main>
    );
}