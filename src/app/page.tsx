import React from "react";
import NavBar from "@/components/NavBar";


export default function HomePage() {
  return (
    <main>
      <NavBar/>
      <h1>Home Page</h1>
      <a href="/schedule">Go to Schedule</a>
    </main>
  );
}