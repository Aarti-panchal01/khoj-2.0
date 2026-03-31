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
<<<<<<< HEAD
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
=======
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
<<<<<<< HEAD
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
=======
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 sm:h-5 sm:w-5 text-gray-400" />
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
<<<<<<< HEAD
            w-full px-4 py-2.5 border rounded-xl
            text-base sm:text-sm text-slate-900 placeholder:text-slate-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-500' : 'border-slate-300 focus:ring-primary-200 focus:border-primary-500'}
            focus:outline-none focus:ring-2
            transition-all duration-200
            disabled:bg-slate-100 disabled:cursor-not-allowed
=======
            w-full px-4 py-3 sm:py-2.5 border-2 rounded-xl sm:rounded-lg
            text-base sm:text-sm
            ${Icon ? 'pl-10 sm:pl-10' : ''}
            ${error ? 'border-danger-500 focus:ring-danger-500' : 'border-gray-300 focus:ring-primary-500'}
            focus:outline-none focus:ring-2 focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
            touch-manipulation
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
