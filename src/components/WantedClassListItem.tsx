import React from "react";

interface WantedClassListItemProps {
  id: number;
  className: string;
  type: string;
  location: string;
  onClick?: () => void;
}

export default function WantedClassListItem({
  id,
  className,
  type,
  location,
  onClick,
}: WantedClassListItemProps) {
  return (
    <li className="list-none">
      <div
        className="rounded-lg shadow-sm p-3 m-4 border border-gray-700 bg-gray-900 flex items-center divide-x divide-gray-700 cursor-pointer hover:bg-gray-800 transition-colors duration-150"
      >
        <div className="px-20 flex items-center">
          <span className="text-lg font-bold">{id}</span>
        </div>

        <div className="px-20 flex-1">
          <span className="text-lg font-semibold">{className}</span>
        </div>

        <div className="px-20">
          <span className="text-lg text-gray-300">{type}</span>
        </div>

        <div className="px-20">
          <span className="text-lg text-gray-300">{location}</span>
        </div>
      </div>
    </li>
  );
}