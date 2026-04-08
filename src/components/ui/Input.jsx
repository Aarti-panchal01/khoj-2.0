import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  wrapperClassName = '',
  inputClassName = '',
  inputStyle,
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
      <div className={`relative ${wrapperClassName}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 border rounded-lg
            text-base sm:text-sm text-gray-900 placeholder:text-gray-400 bg-white
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
            focus:outline-none
            transition-all duration-200
            disabled:bg-gray-50 disabled:cursor-not-allowed touch-manipulation
            hover:border-gray-300
            ${inputClassName}
          `}
          style={{ minHeight: '44px', ...(inputStyle || {}) }}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
