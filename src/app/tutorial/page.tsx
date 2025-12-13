"use client";
import React from "react";
import { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function TutorialPage() {
    useEffect(() => {
        document.title = "Home";
    });

    return (
        <main className='bg-black'>
            <NavBar/>



            <Footer/>
        </main>
    );
}