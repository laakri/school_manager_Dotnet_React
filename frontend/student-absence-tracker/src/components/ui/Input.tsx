import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", ...props }: InputProps) => {
  return (
    <div className="w-full ">
      {label && (
        <label className="block text-sm text-left font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          block w-full rounded-sm border border-gray-300 bg-white px-4 py-2
          text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none 
          focus:ring focus:ring-indigo-200 sm:text-sm
          ${error ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-200" : ""}
          ${className}
        `}
        {...props}
        placeholder="enter text"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;
