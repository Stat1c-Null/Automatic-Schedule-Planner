import React from "react";

interface HoverButtonSmallProps {
  text: string;
  onClick?: () => void;
}

export default function HoverButtonSmall({
  text,
  onClick,
}: HoverButtonSmallProps) {
  return (
    <button onClick={onClick} className="px-4 py-1 text-black font-bold bg-yellow-300 rounded-lg transition duration-300 ease-in-out transform hover:bg-yellow-500 hover:scale-105">
      {text}
    </button>
  );
}