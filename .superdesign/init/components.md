# components.md

Shared UI primitives and reusable components (full source).

## Button
- Source: `src/components/ui/Button.jsx`
- Description: Motion button with variants, sizes, loading, optional icon.

```jsx
import { motion } from 'framer-motion';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  loading = false,
  className = '',
}) => {
  const baseStyles = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-soft',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-soft',
    ghost: 'hover:bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-sm sm:text-base min-h-[44px]',
    lg: 'px-6 py-3 text-base sm:text-lg min-h-[48px]',  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
```

## Input
- Source: `src/components/ui/Input.jsx`
- Description: Labeled input with optional icon + error.

```jsx
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
```

## Select
- Source: `src/components/ui/Select.jsx`
- Description: Native select with optional label + error.

```jsx
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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-2.5 border rounded-xl
            text-base sm:text-sm text-slate-900
            appearance-none cursor-pointer
            ${error ? 'border-danger-400 focus:ring-danger-200 focus:border-danger-500' : 'border-slate-300 focus:ring-primary-200 focus:border-primary-500'}
            focus:outline-none focus:ring-2
            transition-all duration-200
            disabled:bg-slate-100 disabled:cursor-not-allowed            bg-white
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
          <ChevronDown className="w-5 h-5 text-slate-400" />        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
```

## CustomSelect
- Source: `src/components/ui/CustomSelect.jsx`
- Description: Custom dropdown select for better mobile behavior.

```jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select an option',
  icon: Icon,
  className = '',
  name = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Force re-render when options change (fixes mobile rendering issue)
  const [forceRender, setForceRender] = useState(0);
  
  useEffect(() => {
    if (options && options.length > 0) {
      console.log('[CustomSelect] Options updated:', options.length, 'options available');
      console.log('[CustomSelect] First option:', options[0]);
      // Force component to re-render when options change
      setForceRender(prev => prev + 1);
    }
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    console.log('[CustomSelect] Option selected:', optionValue);
    onChange({ target: { value: optionValue, name } });
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    console.log('[CustomSelect] Toggle dropdown. Current isOpen:', isOpen);
    console.log('[CustomSelect] Options available:', options?.length || 0);
    
    // Only open if we have options or if closing
    if (!isOpen || options.length > 0) {
      setIsOpen(!isOpen);
    } else {
      console.warn('[CustomSelect] Cannot open dropdown - no options available');
    }
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Log dropdown state for mobile debugging
  useEffect(() => {
    if (isOpen) {
      console.log('[CustomSelect] Dropdown opened. Options count:', options?.length || 0);
      console.log('[CustomSelect] Options array:', options);
      console.log('[CustomSelect] Is array?', Array.isArray(options));
      console.log('[CustomSelect] Force render count:', forceRender);
    }
  }, [isOpen, options, forceRender]);

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={handleToggleDropdown}
          className={`
            w-full px-4 py-3 sm:py-2.5 border-2 rounded-xl sm:rounded-lg
            text-base sm:text-sm text-left
            ${error ? 'border-danger-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : ''}
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-all duration-200
            bg-white
            touch-manipulation
            flex items-center justify-between
            relative z-10
          `}
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <div 
            key={`dropdown-${options.length}-${forceRender}`}
            className="absolute z-[9999] w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-2xl overflow-auto"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '280px' }}
          >
            {/* Placeholder option */}
            <div
              onClick={() => handleSelect('')}
              className="px-3 py-2 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors text-gray-500 border-b border-gray-100 touch-manipulation text-sm"
            >
              {placeholder}
            </div>
            
            {/* Options - Defensive rendering with explicit checks */}
            {Array.isArray(options) && options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors touch-manipulation
                    flex items-center justify-between text-sm
                    ${value === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 active:bg-gray-100 text-gray-900'}
                  `}
                >
                  <span className="text-sm leading-tight">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-400 text-center text-sm">
                No options available
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default CustomSelect;
```

## Card
- Source: `src/components/ui/Card.jsx`
- Description: Surface container with optional motion hover and onClick.

```jsx
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -2, boxShadow: '0 8px 20px -6px rgb(15 23 42 / 0.16), 0 4px 8px -4px rgb(15 23 42 / 0.12)' },    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-slate-200 shadow-soft        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
```

## Badge
- Source: `src/components/ui/Badge.jsx`
- Description: Small label badge with variants.

```jsx
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-primary-50 text-primary-700 border border-primary-200',
    success: 'bg-success-50 text-success-700 border border-success-100',
    warning: 'bg-warning-50 text-warning-700 border border-warning-100',
    danger: 'bg-danger-50 text-danger-700 border border-danger-100',
    found: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    lost: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>      {children}
    </span>
  );
};

export default Badge;
```

## Modal
- Source: `src/components/ui/Modal.jsx`
- Description: Generic modal with framer-motion transitions.

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} my-8`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
```

