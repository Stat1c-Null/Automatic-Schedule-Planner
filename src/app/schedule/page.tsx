import React from 'react';
import HoverButton from '@/components/HoverButton';
import NavBar from '@/components/NavBar';
import InputField from '@/components/InputField';

export default function SchedulePage() {
  return (
    <main>
      <NavBar/>

      <div id="schedule-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300 overflow-auto">
        <div className="min-w-[900px] grid grid-cols-[120px_repeat(5,1fr)] gap-2">
          {/* Time labels column */}
          <div className="flex flex-col">
            <div className="h-12 flex items-center justify-center font-bold">&nbsp;</div>
            {Array.from({ length: 16 }).map((_, i) => {
              const hour = 7 + i; // 7..22
              const ampm = hour < 12 ? 'AM' : 'PM';
              const displayHour = ((hour + 11) % 12) + 1; // convert 0-23 to 12-hour
              return (
                <div key={i} className="h-12 border-t border-gray-200 text-sm text-yellow-300 flex items-start pl-2">
                  {`${displayHour}:00 ${ampm}`}
                </div>
              );
            })}
          </div>

          {/* Days columns */}
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="border border-gray-100 bg-gray-800 text-yellow-300 rounded-xs">
              <div className="h-12 flex items-center justify-center font-semibold border-b border-gray-100 bg-black">
                {day}
              </div>
              <div>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="h-12 border-t border-gray-100 bg-black hover:bg-gray-500">
                    {/* slot placeholder */}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="add-event-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
        <h1 className="text-2xl font-bold mb-4 mt-5">Add new event to your schedule</h1>
        <InputField text="Event Name" placeholder="Enter the event name" value={""} example="e.g., Math Class" name="eventName"/>
        <HoverButton text="Add Event"/>
      </div>

      <div id="class-selection-container" className="mt-4">

      </div>

      <div id="footer" className="bottom-0 w-full h-15 bg-gray-800 text-white flex items-center justify-center">
        <p className="text-sm">Developed by Group 6 CLD</p>
      </div>
      
      <a href="/">Go Home</a>
    </main>
  );
}