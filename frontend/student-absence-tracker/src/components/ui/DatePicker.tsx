interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  onChange?: (date: Date | null) => void;
}

const DatePicker = ({
  label,
  error,
  onChange,
  className = "",
  ...props
}: DatePickerProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type="date"
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
          ${error ? "border-red-300" : ""}
          ${className}
        `}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : null;
          onChange?.(date);
        }}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DatePicker;
