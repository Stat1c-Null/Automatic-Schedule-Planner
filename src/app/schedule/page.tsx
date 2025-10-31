"use client";

import React, { useState } from 'react';
import HoverButton from '@/components/HoverButton';
import NavBar from '@/components/NavBar';
import InputField from '@/components/InputField';
import DateTime from '@/components/DateTime';
import HoverButtonSmall from '@/components/HoverButtonSmall';
import CalendarEvent from '@/components/CalendarEvent';

export default function SchedulePage() {
  const [eventName, setEventName] = useState("");
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
  </div>
  {/* end main padding wrapper */}
      {/* Class Selection Section */}
      <div id="class-selection-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
          <h1 className="text-2xl font-bold mb-4 mt-30 text-white">Available Classes</h1>
          <div id="classes-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300 overflow-auto">
            
          </div>
      </div>

      <div id="footer" className="bottom-0 w-full h-15 bg-gray-800 text-white flex items-center justify-center">
        <p className="text-sm">Developed by Group 6 CLD</p>
      </div>
    </main>
  );
}