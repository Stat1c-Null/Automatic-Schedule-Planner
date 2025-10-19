import React from "react";

interface DateTimeProps {
  dayText: string;
  timeText: string;
  dayPlaceholder: string;
  timePlaceholder: string;
  dayValue: string;
  timeValue: string;
  dayExample?: string;
  timeExample?: string;
  name: string;
  index?: number;
  onDayChange?: (value: string, index?: number) => void;
  onTimeChange?: (value: string, index?: number) => void;
}

export default function DateTime({
  dayText,
  timeText,
  dayPlaceholder,
  timePlaceholder,
  dayValue,
  timeValue,
  dayExample,
  timeExample,
  name,
  index,
  onDayChange,
  onTimeChange,
}: DateTimeProps) {
  const dayInputID = `input-${name}-day-${index ?? 0}`;
  const timeInputID = `input-${name}-time-${index ?? 0}`;
  //TODO: Refactor this into nice selector instead of input form
  return (
    <div className="flex flex-row items-center my-2 gap-4 w-full">
      <div id="day" className="w-1/2">
        <label
          htmlFor={dayInputID}
          className="block text-sm font-medium text-white mb-1 text-left"
        >
          {dayText}
        </label>
        <input
          type="text"
          id={dayInputID}
          name={`${name}-day-${index ?? 0}`}
          value={dayValue}
          onChange={(e) => onDayChange && onDayChange(e.target.value, index)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:bg-gray-900 hover:border-yellow-300 transition-colors duration-200 sm:text-sm text-white bg-transparent"
          placeholder={dayPlaceholder}
        />
        {dayExample && (
          <label
            htmlFor={dayInputID}
            className="block text-xs font-light text-gray-300 mt-1 text-left"
          >
            {dayExample}
          </label>
        )}
      </div>
      <div id="time" className="w-1/2">
        <label
          htmlFor={timeInputID}
          className="block text-sm font-medium text-white mb-1 text-left"
        >
          {timeText}
        </label>
        <input
          type="text"
          id={timeInputID}
          name={`${name}-time-${index ?? 0}`}
          value={timeValue}
          onChange={(e) => onTimeChange && onTimeChange(e.target.value, index)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:bg-gray-900 hover:border-yellow-300 transition-colors duration-200 sm:text-sm text-white bg-transparent"
          placeholder={timePlaceholder}
        />
        {timeExample && (
          <label
            htmlFor={timeInputID}
            className="block text-xs font-light text-gray-300 mt-1 text-left"
          >
            {timeExample}
          </label>
        )}
      </div>
    </div>
  );
}
