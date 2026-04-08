import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-2.5 border rounded-lg
            text-base sm:text-sm text-gray-900 bg-white
            appearance-none cursor-pointer
            ${error ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
            focus:outline-none
            transition-all duration-200
            disabled:bg-gray-50 disabled:cursor-not-allowed
            pr-10
            touch-manipulation
            hover:border-gray-300
          `}
          style={{ minHeight: '44px' }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
