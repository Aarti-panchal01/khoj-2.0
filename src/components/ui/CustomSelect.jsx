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
    onChange({ target: { value: optionValue, name } });
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    // Only open if we have options or if closing
    if (!isOpen || options.length > 0) {
      setIsOpen(!isOpen);
    }
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
