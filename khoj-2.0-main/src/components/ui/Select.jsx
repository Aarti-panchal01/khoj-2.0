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
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 sm:py-2.5 border-2 rounded-xl sm:rounded-lg
            text-base sm:text-sm
            appearance-none cursor-pointer
            ${error ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-300 focus:ring-primary-500'}
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
            bg-white
            pr-10
            touch-manipulation
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
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
