import React from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: Option[];
  error?: string;
  onChange?: (value: string) => void;
}

const Select = ({
  label,
  options,
  error,
  onChange,
  className = "",
  ...props
}: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            block w-full appearance-none rounded-lg border border-gray-300
            bg-white px-4 py-2 text-gray-700 shadow-sm
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400
            focus:outline-none transition duration-200 ease-in-out
            hover:shadow-md
            ${error ? "border-red-400 focus:ring-red-300" : ""}
            ${className}
          `}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          <option value="" disabled hidden>
            Select an option
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="w-5 h-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
