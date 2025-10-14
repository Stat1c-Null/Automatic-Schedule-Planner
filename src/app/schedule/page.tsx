import React from 'react';
import HoverButton from '@/components/HoverButton';

export default function SchedulePage() {
  return (
    <main>
      <div id="header-container" className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white flex items-center justify-left px-4">
        <h1 className="text-xl font-bold">Schedule Builder</h1>
      </div>

      <div id="schedule-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300">
        <HoverButton text="Test" />
      </div>

      <div id="class-selection-container" className="">

      </div>

      <div id="footer" className="absolute bottom-0 w-full h-12 bg-gray-800 text-white flex items-center justify-center">
        <p className="text-sm">Developed by Group 6 CLD</p>
      </div>
      
      <a href="/">Go Home</a>
    </main>
  );
}