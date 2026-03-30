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
    onChange({ target: { value: optionValue, name } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

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
          onClick={() => setIsOpen(!isOpen)}
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
            className="absolute z-[9999] w-full mt-2 bg-white border-2 border-gray-200 rounded-xl sm:rounded-lg shadow-2xl max-h-60 overflow-auto"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0 }}
          >
            {/* Placeholder option */}
            <div
              onClick={() => handleSelect('')}
              className="px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors text-gray-500 border-b border-gray-100 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              {placeholder}
            </div>
            
            {/* Options */}
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors touch-manipulation
                    flex items-center justify-between
                    ${value === option.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 active:bg-gray-100 text-gray-900'}
                  `}
                  style={{ minHeight: '44px' }}
                >
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && (
                    <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-400 text-center">
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
