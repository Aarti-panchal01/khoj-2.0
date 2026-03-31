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
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 border rounded-xl
            text-base sm:text-sm text-slate-900 placeholder:text-slate-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-500' : 'border-slate-300 focus:ring-primary-200 focus:border-primary-500'}
            focus:outline-none focus:ring-2
            transition-all duration-200
            disabled:bg-slate-100 disabled:cursor-not-allowed            touch-manipulation
          `}
          style={{ minHeight: '44px' }}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
