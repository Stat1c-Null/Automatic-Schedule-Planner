import React from "react";

interface HoverButtonProps {
  text: string;
}

export default function HoverButton({
  text,
}: HoverButtonProps) {
  return (
    <button className="px-7 py-2 text-black font-bold bg-yellow-300 rounded-lg transition duration-300 ease-in-out transform hover:bg-yellow-500 hover:scale-105">
      {text}
    </button>
  );
}