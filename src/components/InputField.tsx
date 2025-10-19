import React from "react";

interface InputFieldProps {
  text: string;
  placeholder?: string;
  value: string;
  example?: string;
  name: string;
  onChange?: (value: string) => void;
}

export default function InputField({
  text,
  placeholder,
  value,
  example,
  name,
  onChange,
}: InputFieldProps) {
  const inputID = `input-${name}`;

  return (
    <div className="flex flex-col items-center my-4 w-full">
      <div className="w-full max-w-2xl">
        <label
          htmlFor={inputID}
          className="block text-sm font-medium text-white mb-1 text-left"
        >
          {text}
        </label>
        <input
          type="text"
          id={inputID}
          name={name}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:bg-gray-900 hover:border-yellow-300 transition-colors duration-200 sm:text-sm text-white bg-transparent"
          placeholder={placeholder}
        />
        {example && (
          <label
            htmlFor={inputID}
            className="block text-xs font-light text-gray-300 mt-1 text-left"
          >
            {example}
          </label>
        )}
      </div>
    </div>
  );
}
