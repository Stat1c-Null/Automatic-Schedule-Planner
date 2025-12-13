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


                </div>

            </div>

            <Footer/>
        </main>
    );
}