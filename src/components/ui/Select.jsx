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
        <label className="block text-sm font-semibold text-ink-800 mb-1.5">
          {label}
          {required && <span className="text-lost-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-2.5 border rounded-xl
            text-base sm:text-sm text-ink-950 bg-surface-0
            appearance-none cursor-pointer
            ${error ? 'border-lost-400 focus:ring-lost-200 focus:border-lost-600' : 'border-ink-300 focus:ring-primary-200 focus:border-primary-600'}
            focus:outline-none focus:ring-2
            transition-all duration-200
            disabled:bg-surface-100 disabled:cursor-not-allowed bg-surface-0
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
          <ChevronDown className="w-5 h-5 text-ink-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-lost-700">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
