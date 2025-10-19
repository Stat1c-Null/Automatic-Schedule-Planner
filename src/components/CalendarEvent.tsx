import React from "react";

interface CalendarEventProps {
  idx: number;
  ev: {
    title: string;
    start: number; 
    end: number; 
  };
  top: number; 
  height: number; 
  formatHour: (value: number) => string;
}

export default function CalendarEvent({
  idx,
  ev,
  top,
  height,
  formatHour,
}: CalendarEventProps) {
  return (
    <div
      key={idx}
      className="absolute left-1/6 right-1/6 bg-yellow-300 text-black rounded px-1 py-0.5 overflow-hidden"
      style={{ top: `${top}px`, height: `${height}px` }}
      title={`${ev.title} ${ev.start}-${ev.end}`}
    >
      <div className="text-xs font-semibold truncate">{ev.title}</div>
      <div className="text-[10px]">{`${formatHour(ev.start)} - ${formatHour(ev.end)}`}</div>
    </div>
  );
}