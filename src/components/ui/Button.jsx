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
<<<<<<< HEAD
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
    lg: 'px-6 py-3 text-base sm:text-lg min-h-[48px]',
=======
  const baseStyles = 'font-medium rounded-xl sm:rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
    danger: 'bg-danger-500 hover:bg-danger-600 active:bg-danger-700 text-white',
    ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-2 sm:py-1.5 text-sm min-h-[40px] sm:min-h-[36px]',
    md: 'px-4 py-3 sm:py-2 text-base sm:text-base min-h-[44px] sm:min-h-[40px]',
    lg: 'px-6 py-4 sm:py-3 text-lg min-h-[48px] sm:min-h-[44px]',
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
  };

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
