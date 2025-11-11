"use client";
import React, { useState, useEffect } from 'react';
import HoverButton from '@/components/HoverButton';
import NavBar from '@/components/NavBar';
import InputField from '@/components/InputField';
import DateTime from '@/components/DateTime';
import HoverButtonSmall from '@/components/HoverButtonSmall';
import CalendarEvent from '@/components/CalendarEvent';
import WantedClassListItem from '@/components/WantedClassListItem';
import Footer from '@/components/Footer';

export default function SchedulePage() {
  useEffect(() => {
    document.title = "Schedule";
  });

  const [eventName, setEventName] = useState("");
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [classType, setClassType] = useState("");
  const [classLocation, setClassLocation] = useState("");

  const [wantedClasses, setWantedClasses] = useState<Array<{id: number; className: string; type: string; location: string;}>>([]);
  const [availableClasses, setAvailableClasses] = useState<Array<{id: number; className: string; type: string; location: string;}>>([]);

  // Each dateTime row: { day: string, time: string }
  const [dateTimes, setDateTimes] = useState<Array<{ day: string; time: string }>>([
    { day: "", time: "" },
  ]);

  // Events stored for rendering; each event has title, day, startHour(7-22), endHour
  const [events, setEvents] = useState<Array<{ title: string; day: string; start: number; end: number }>>([]);

  function addDateTimeRow() {
    setDateTimes((d) => [...d, { day: "", time: "" }]);
  }

  function removeDateTimeRow(index: number) {
    setDateTimes((d) => d.filter((_, i) => i !== index));
  }

  function updateDateTimeRow(index: number, field: 'day' | 'time', value: string) {
    setDateTimes((d) => d.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  // Parse a time like "10:00 AM - 11:30 AM" into start/end hours as floats
  function parseTimeRange(range: string): { start: number; end: number } | null {
    const parts = range.split('-').map((s) => s.trim());
    if (parts.length !== 2) return null;
    const toHour = (s: string) => {
      // Accept formats like "10:00 AM" or "14:00"
      const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!m) return NaN;
      let hour = parseInt(m[1], 10);
      const minutes = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3];
      if (ampm) {
        const up = ampm.toUpperCase();
        if (up === 'PM' && hour !== 12) hour += 12;
        if (up === 'AM' && hour === 12) hour = 0;
      }
      return hour + minutes / 60;
    };

    const start = toHour(parts[0]);
    const end = toHour(parts[1]);
    if (Number.isNaN(start) || Number.isNaN(end)) return null;
    return { start, end };
  }

  function formatHour(value: number) {
    const hour = Math.floor(value);
    const minutes = Math.round((value - hour) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour + 11) % 12) + 1;
    const mm = minutes.toString().padStart(2, '0');
    return `${displayHour}:${mm} ${ampm}`;
  }

  // Add event to the schedule
  function handleAddEvent() {
    const newEvents: Array<{ title: string; day: string; start: number; end: number }> = [];
    for (const row of dateTimes) {
      const parsed = parseTimeRange(row.time);
      if (!parsed) continue; // skip invalid rows
      newEvents.push({ title: eventName || 'Untitled', day: row.day, start: parsed.start, end: parsed.end });
    }
    setEvents((e) => [...e, ...newEvents]);
    // reset form
    setEventName('');
    setDateTimes([{ day: '', time: '' }]);
  }

  // Add wanted class to the list
  function handleAddWantedClassEvent() {
    const newWantedClass: Array<{ id: number; className: string; type: string; location: string }> = [];
    newWantedClass.push({ id: parseInt(classId) || 0, className: className || 'Unnamed', type: classType || 'Unknown', location: classLocation || 'TBD' });
    setWantedClasses((e) => [...e, ...newWantedClass]);
    // reset form
    setClassId('');
    setClassName('');
    setClassType('');
    setClassLocation('');
  }

  //Refresh list of available classes based on current schedule and wanted classes
  function refreshAvailableClasses() {

  }

  return (
    <main className='bg-black'>
      <NavBar/>
      {/* pad the page content so the fixed NavBar doesn't overlap it */}
      <div className="pt-16">

        {/* Add Event Section */}
        <div id="add-event-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
          <h1 className="text-2xl font-bold mb-4 mt-30 text-white">Add new event to your schedule</h1>
          <InputField text="Event Name" placeholder="Enter the event name" value={eventName} example="e.g., Math Class" name="eventName" onChange={setEventName} />

          <div id="event-date-time-container" className="flex flex-col items-center justify-center gap-4 mb-6 w-full max-w-2xl">
            {dateTimes.map((dt, idx) => (
              <div key={idx} className="flex items-center w-full">
                <DateTime
                  dayText="Event Day"
                  timeText="Event Time"
                  dayPlaceholder="Enter the event day (e.g., Monday)"
                  timePlaceholder="e.g., 10:00 AM - 11:00 AM"
                  dayValue={dt.day}
                  timeValue={dt.time}
                  name={`eventDateTime-${idx}`}
                  index={idx}
                  onDayChange={(v) => updateDateTimeRow(idx, 'day', v)}
                  onTimeChange={(v) => updateDateTimeRow(idx, 'time', v)}
                />
                <div className="ml-2 mt-5 flex flex-col gap-2">
                  {idx === 0 ? (
                    null
                  ) : (
                    <HoverButtonSmall text="-" onClick={() => removeDateTimeRow(idx)} />
                  )}
                </div>
              </div>
            ))}
            <HoverButtonSmall text="+" onClick={addDateTimeRow} />
          </div>
          <HoverButton text="Add Event" onClick={handleAddEvent} />
        </div>

        {/* Schedule Display Section */}
        <div id="schedule-container" className="rounded-lg shadow-lg p-4 m-4 mt-6 border border-gray-300 overflow-auto">
          <div className="min-w-[900px] grid grid-cols-[120px_repeat(5,1fr)] gap-2">
            {/* Time labels column */}
            <div className="flex flex-col">
              <div className="h-12 flex items-center justify-center font-bold">&nbsp;</div>
              {Array.from({ length: 16 }).map((_, i) => {
                const hour = 7 + i;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const displayHour = ((hour + 11) % 12) + 1; // convert 0-23 to 12-hour
                return (
                  <div key={i} className="h-12 border-t border-gray-200 text-sm text-white flex items-start pl-2">
                    {`${displayHour}:00 ${ampm}`}
                  </div>
                );
              })}
            </div>

            {/* Days columns */}
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
              <div key={day} className="relative border border-gray-100 bg-gray-800 text-white rounded-xs">
                <div className="h-12 flex items-center justify-center font-semibold border-b border-gray-100 bg-black">
                  {day}
                </div>
                <div className="relative">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="h-12 border-t border-gray-100 bg-black hover:bg-gray-500" />
                  ))}

                  {/* Render all of the events for current day */}
                  {events
                    .map((ev, idx) => ({ ev, idx }))
                    .filter(({ ev }) => ev.day.toLowerCase() === day.toLowerCase())
                    .map(({ ev, idx }) => {
                      const dayStart = 7;
                      const slotHeight = 48; 
                      const top = (ev.start - dayStart) * slotHeight;
                      const height = Math.max((ev.end - ev.start) * slotHeight, slotHeight * 0.5);
                      return (
                        <CalendarEvent 
                          key={idx}
                          idx={idx}
                          ev={ev}
                          top={top}
                          height={height}
                          formatHour={formatHour}
                        />
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wanted Classes Selection Section */}
        <div id="wanted-classes-selection-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
            <h1 className="text-2xl font-bold mb-4 mt-30 text-white">Add classes you would like to take next semester</h1>
            <div id="classes-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300 overflow-auto">
              {wantedClasses.length === 0 ? (
                <p className="text-gray-500 mx-80 my-10">No classes selected</p>
              ) : (
                wantedClasses.map((dt, idx) => (
                <div key={idx} className="flex items-center w-full">
                  <WantedClassListItem
                    id={dt.id}
                    className={dt.className}
                    type={dt.type}
                    location={dt.location}
                    onClick={() => console.log('Clicked!')}
                  />
                </div>
              )))}
            </div>

            <div id="class-input-form-container" className="flex flex-row items-center justify-center gap-4 mb-6 w-200">
              <InputField text="Class ID" placeholder="Enter the class ID" value={classId} example="e.g., 3306" name="eventName" onChange={setClassId} />
              <InputField text="Name" placeholder="Enter the class name" value={className} example="e.g., Data Structures" name="eventName" onChange={setClassName} />
              <InputField text="Type" placeholder="Enter the class type" value={classType} example="e.g., CS" name="eventName" onChange={setClassType} />
              <InputField text="Location" placeholder="Enter the class location" value={classLocation} example="e.g., Online" name="eventName" onChange={setClassLocation} />
            </div>

            <HoverButton text="Add Class" onClick={handleAddWantedClassEvent} />
        </div>

        {/* Available classes based on your schedule and wanted classes selection */}
        <div id="available-classes-selection-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
            <h1 className="text-2xl font-bold mb-4 mt-30 text-white">Available classes based on your schedule</h1>
            <div id="classes-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300 overflow-auto">
              {availableClasses.length === 0 ? (
                <p className="text-gray-500 mx-80 my-10">No classes available</p>
              ) : (
                availableClasses.map((dt, idx) => (
                <div key={idx} className="flex items-center w-full">
                  {/* Create component available classes and call it here*/}
                </div>
              )))}
            </div>

            <HoverButton text="Refresh List" onClick={refreshAvailableClasses} />
        </div>
      

      </div>
      {/* end main padding wrapper */}
      

      <Footer/>
    </main>
  );
}