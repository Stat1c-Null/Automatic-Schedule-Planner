"use client";

import React, { useState, useEffect, useRef } from "react";
import HoverButton from "@/components/HoverButton";
import NavBar from "@/components/NavBar";
import InputField from "@/components/InputField";
import DateTime from "@/components/DateTime";
import HoverButtonSmall from "@/components/HoverButtonSmall";
import CalendarEvent from "@/components/CalendarEvent";
import WantedClassListItem from "@/components/WantedClassListItem";
import Footer from "@/components/Footer";
import type { ScheduleResponse } from "@/lib/scheduler";

// API gateway endpoint for user class storage
const API_URL = "https://c82cgy1qwi.execute-api.us-east-2.amazonaws.com/classes"; 

export default function SchedulePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // User identity management
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    document.title = "Schedule";
    
    // Establish User Identity
    let storedId = localStorage.getItem("schedule_user_id");
    if (!storedId) {
      storedId = crypto.randomUUID(); // Native browser UUID generation
      localStorage.setItem("schedule_user_id", storedId);
    }
    setUserId(storedId);
  }, []);

  // Load saved classes
  useEffect(() => {
    if (!userId) return;

    async function fetchUserClasses() {
      try {
        const res = await fetch(`${API_URL}?userId=${userId}`, {
          method: "GET",
        });
        if (res.ok) {
          const data = await res.json();
          // Map DynamoDB data back to frontend structure
          // DynamoDB returns { userId, classKey, id, className, type, location }
          setWantedClasses(data); 
        }
      } catch (err) {
        console.error("Failed to fetch user classes", err);
      }
    }

    fetchUserClasses();
  }, [userId]);


  // Load available course codes from backend API on component mount
  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/v1/courses?program=Computer%20Science%20B.S.");
        if (!res.ok) {
          console.error("Courses API error", await res.text());
          return;
        }

        const data: Array<{
          program_title: string;
          course: { name: string; catalog_id: number; core_id: number; course_id: number };
        }> = await res.json();

        const codes = data.map((c) => extractCourseCode(c.course.name));
        setAvailableCourseCodes(codes);
      } catch (err) {
        console.error("Network or parsing error while loading courses", err);
      } finally {
        setCoursesLoaded(true);
      }
    }

    loadCourses();
  }, []);

  // Utility functions
  function hoursToTimeString(value: number): string {
    const hour = Math.floor(value);
    const minutes = Math.round((value - hour) * 60);
    const hh = hour.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function normalizeDay(day: string): string {
    return day.trim().toLowerCase().slice(0, 3);
  }

  function extractCourseCode(courseName: string): string {
    return courseName.split(":")[0].trim().toUpperCase();
  }

  type Timeslot = {
    day: string;
    start: string;
    end: string;
  };
  
  function timeslotsOverlap(a: Timeslot, b: Timeslot): boolean {
    if (normalizeDay(a.day) !== normalizeDay(b.day)) return false;
    const startA = timeToMinutes(a.start);
    const endA = timeToMinutes(a.end);
    const startB = timeToMinutes(b.start);
    const endB = timeToMinutes(b.end);
    return startA < endB && startB < endA;
  }

  // STATE
  const [eventName, setEventName] = useState("");
  const [classId, setClassId] = useState("");
  const [className, setClassName] = useState("");
  const [classType, setClassType] = useState("");
  const [classLocation, setClassLocation] = useState("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const [availableCourseCodes, setAvailableCourseCodes] = useState<string[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [generatedSchedules, setGeneratedSchedules] = useState<ScheduleResponse["schedules"]>([]);

  // Wanted Classes State
  const [wantedClasses, setWantedClasses] = useState<
    Array<{ id: number; className: string; type: string; location: string }>
  >([]);

  const [dateTimes, setDateTimes] = useState<
    Array<{ day: string; time: string }>
  >([{ day: "", time: "" }]);

  const [events, setEvents] = useState<
    Array<{ title: string; day: string; start: number; end: number }>
  >([]);

  function addDateTimeRow() {
    setDateTimes((d) => [...d, { day: "", time: "" }]);
  }

  function removeDateTimeRow(index: number) {
    setDateTimes((d) => d.filter((_, i) => i !== index));
  }

  function updateDateTimeRow(index: number, field: "day" | "time", value: string) {
    setDateTimes((d) =>
      d.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function parseTimeRange(range: string): { start: number; end: number } | null {
    const parts = range.split("-").map((s) => s.trim());
    if (parts.length !== 2) return null;
    const toHour = (s: string) => {
      const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!m) return NaN;
      let hour = parseInt(m[1], 10);
      const minutes = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3];
      if (ampm) {
        const up = ampm.toUpperCase();
        if (up === "PM" && hour !== 12) hour += 12;
        if (up === "AM" && hour === 12) hour = 0;
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
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = ((hour + 11) % 12) + 1;
    const mm = minutes.toString().padStart(2, "0");
    return `${displayHour}:${mm} ${ampm}`;
  }

  function handleAddEvent() {
    const newEvents: Array<{
      title: string;
      day: string;
      start: number;
      end: number;
    }> = [];
    for (const row of dateTimes) {
      const parsed = parseTimeRange(row.time);
      if (!parsed) continue;
      newEvents.push({
        title: eventName || "Untitled",
        day: row.day,
        start: parsed.start,
        end: parsed.end,
      });
    }
    setEvents((e) => [...e, ...newEvents]);
    setEventName("");
    setDateTimes([{ day: "", time: "" }]);
  }

  // --- API COMMUNICATION HELPERS ---

  async function apiAddClasses(classesToAdd: any[]) {
    if (!userId) return;
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, classes: classesToAdd }),
      });
    } catch (e) {
      console.error("Failed to sync add with DB", e);
      setWarningMessage("Failed to save to database.");
    }
  }

  async function apiDeleteClass(classId: number, classType: string) {
    if (!userId) return;
    try {
      // Logic for Sort Key must match Lambda
      const classKey = `${classType}-${classId}`.toUpperCase();
      
      await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, classKey }),
      });
    } catch (e) {
      console.error("Failed to sync delete with DB", e);
    }
  }

  async function handleAddWantedClassEvent() {
    setWarningMessage(null);

    const trimmedId = classId.trim();
    const trimmedType = classType.trim().toUpperCase();

    if (!trimmedId || !trimmedType) {
      setWarningMessage("Please enter both a class ID and a class type (e.g., CS 3305).");
      return;
    }

    if (!coursesLoaded) {
      setWarningMessage("Course list is still loading. Please try again in a moment.");
      return;
    }

    if (availableCourseCodes.length === 0) {
      setWarningMessage("Could not load the course catalog from the server. Please try refreshing the page.");
      return;
    }

    const desiredCode = `${trimmedType} ${trimmedId}`.toUpperCase();
    const existsInCatalog = availableCourseCodes.some(
      (code) => code.toUpperCase() === desiredCode
    );

    if (!existsInCatalog) {
      setWarningMessage("Class not found in the course catalog API. Please check the ID and type.");
      return;
    }

    const alreadyInWanted = wantedClasses.some(
      (c) => c.id === parseInt(trimmedId, 10) && c.type.toUpperCase() === trimmedType
    );

    if (alreadyInWanted) {
      setWarningMessage("This class is already in your wanted list.");
      return;
    }

    const newWantedClass = {
      id: parseInt(trimmedId, 10),
      className: desiredCode,
      type: trimmedType,
      location: classLocation || "TBD",
    };

    // Update UI
    setWantedClasses((prev) => [...prev, newWantedClass]);
    
    // Sync with DB
    await apiAddClasses([newWantedClass]);

    setClassId("");
    setClassName("");
    setClassType("");
    setClassLocation("");
  }

  function buildScheduleRequestFromState() {
    const wc = wantedClasses.map((c) => ({
      code: c.className.trim(),
    }));

    return {
      busyBlocks: [], 
      wantedClasses: wc,
      transportMode: "drive" as const,
    };
  }

  async function refreshAvailableClasses() {
    try {
      const reqBody = buildScheduleRequestFromState();
      const res = await fetch("/api/v1/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        console.error("Schedule API error", await res.text());
        return;
      }

      const data: ScheduleResponse = await res.json();
      setGeneratedSchedules(data.schedules);
    } catch (err) {
      console.error("Network or parsing error", err);
    }
  }

  const eventTimeslots: Timeslot[] = events.map((ev) => ({
    day: ev.day,
    start: hoursToTimeString(ev.start),
    end: hoursToTimeString(ev.end),
  }));

  async function handleDeleteWantedClass(index: number) {
    const classToDelete = wantedClasses[index];
    
    // Update UI immediately
    setWantedClasses((wc) => wc.filter((_, i) => i !== index));
    
    // Sync with DB
    await apiDeleteClass(classToDelete.id, classToDelete.type);
  }

  function handleUploadClasses() {
    fileInputRef.current?.click();
  }

  // Uploaded CSV file handler
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim());
      // Skip header row
      const dataLines = lines.slice(1);
      
      const newClasses: Array<{ id: number; className: string; type: string; location: string }> = [];

      for (const line of dataLines) {
        // Split by comma, handling quoted values
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length >= 4) {
          const [className, classId, classType, classLocation] = values;
          const id = parseInt(classId, 10);
          if (isNaN(id)) continue;

          // Check against current state to avoid UI duplicates
          const exists = wantedClasses.some(
            c => c.id === id && c.type.toUpperCase() === classType.toUpperCase()
          );
          
          if (!exists) {
            newClasses.push({
              id,
              className: className.trim(),
              type: classType.trim().toUpperCase(),
              location: classLocation.trim() || 'TBD',
            });
          }
        }
      }

      if (newClasses.length > 0) {
        // Update UI
        setWantedClasses(prev => [...prev, ...newClasses]);
        setWarningMessage(null);
        
        // Sync with DB (Lambda)
        await apiAddClasses(newClasses);
        
      } else {
        setWarningMessage('No new valid classes found in the CSV file.');
      }
    };

    reader.onerror = () => {
      setWarningMessage('Error reading file. Please try again.');
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  return (
    <main className="bg-black">
      <NavBar />
      <div className="pt-16">
        {/* Add Event Section */}
        <div id="add-event-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
          <h1 className="text-2xl font-bold mb-4 mt-30 text-white">
            Add new event to your schedule
          </h1>
          <InputField
            text="Event Name"
            placeholder="Enter the event name"
            value={eventName}
            example="e.g., Math Class"
            name="eventName"
            onChange={setEventName}
          />

          <div className="flex flex-col items-center justify-center gap-4 mb-6 w-full max-w-2xl">
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
                  onDayChange={(v) => updateDateTimeRow(idx, "day", v)}
                  onTimeChange={(v) => updateDateTimeRow(idx, "time", v)}
                />
                <div className="ml-2 mt-5 flex flex-col gap-2">
                  {idx === 0 ? null : (
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
            <div className="flex flex-col">
              <div className="h-12 flex items-center justify-center font-bold">&nbsp;</div>
              {Array.from({ length: 16 }).map((_, i) => {
                const hour = 7 + i;
                const ampm = hour < 12 ? "AM" : "PM";
                const displayHour = ((hour + 11) % 12) + 1;
                return (
                  <div key={i} className="h-12 border-t border-gray-200 text-sm text-white flex items-start pl-2">
                    {`${displayHour}:00 ${ampm}`}
                  </div>
                );
              })}
            </div>

            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <div key={day} className="relative border border-gray-100 bg-gray-800 text-white rounded-xs">
                <div className="h-12 flex items-center justify-center font-semibold border-b border-gray-100 bg-black">
                  {day}
                </div>
                <div className="relative">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="h-12 border-t border-gray-100 bg-black hover:bg-gray-500" />
                  ))}
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
          <h1 className="text-2xl font-bold mb-4 mt-30 text-white">
            Add classes you would like to take next semester
          </h1>
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
                    onClick={() => console.log("Clicked!")}
                  />
                  <HoverButton text="Remove" onClick={() => handleDeleteWantedClass(idx)} />
                </div>
              ))
            )}
          </div>

          <div id="class-input-form-container" className="flex flex-row items-center justify-center gap-4 mb-6 w-200">
            <InputField
              text="Type"
              placeholder="Enter the class type"
              value={classType}
              example="e.g., CS"
              name="classType"
              onChange={setClassType}
            />
            <InputField
              text="Class ID"
              placeholder="Enter the class ID"
              value={classId}
              example="e.g., 3305"
              name="classId"
              onChange={setClassId}
            />
            <InputField
              text="Name"
              placeholder="Enter the class name"
              value={className}
              example="e.g., Data Structures"
              name="className"
              onChange={setClassName}
            />
            <InputField
              text="Location"
              placeholder="Enter the class location"
              value={classLocation}
              example="e.g., Online"
              name="classLocation"
              onChange={setClassLocation}
            />
          </div>

          <HoverButton text="Add Class" onClick={handleAddWantedClassEvent} />
          <div className="m-5"></div>
          <HoverButton text="Upload List" onClick={handleUploadClasses} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          {warningMessage && <p className="text-red-400 mt-2">{warningMessage}</p>}
        </div>

        {/* Available classes Section */}
        <div id="available-classes-selection-container" className="flex flex-col items-center justify-center m-4 mt-0 mb-4">
          <h1 className="text-2xl font-bold mb-4 mt-30 text-white">
            Available classes based on your schedule
          </h1>
          <div id="classes-container" className="rounded-lg shadow-lg p-4 m-4 mt-20 border border-gray-300 overflow-auto min-w-[600px]">
            {generatedSchedules.length === 0 || generatedSchedules[0].length === 0 ? (
              <p className="text-gray-500 mx-80 my-10">
                No classes available. Click "Refresh List" to generate a schedule.
              </p>
            ) : (
              generatedSchedules[0].map((cls, idx) => {
                const hasConflict = eventTimeslots.some((evSlot) =>
                  timeslotsOverlap(
                    {
                      day: cls.timeslot.day,
                      start: cls.timeslot.start,
                      end: cls.timeslot.end,
                    },
                    evSlot
                  )
                );

                return (
                  <div key={idx} className="flex flex-col w-full border-b border-gray-700 py-3 text-white">
                    <div className="flex justify-between">
                      <span className="font-semibold">{cls.code}</span>
                      {cls.professor.name && (
                        <span>
                          {cls.professor.name}{" "}
                          {cls.professor.avg_rating !== null && (
                            <span className="text-sm text-gray-300">
                              — {cls.professor.avg_rating.toFixed(1)}/5
                              {cls.professor.avg_difficulty !== null &&
                                ` difficulty ${cls.professor.avg_difficulty.toFixed(1)}`}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      {cls.timeslot.day} {cls.timeslot.start}–{cls.timeslot.end} @ {cls.timeslot.location}
                    </div>
                    {hasConflict && <div className="text-sm text-red-400 mt-1">Schedule Conflict</div>}
                  </div>
                );
              })
            )}
          </div>
          <HoverButton text="Refresh List" onClick={refreshAvailableClasses} />
        </div>
      </div>
      <Footer />
    </main>
  );
}