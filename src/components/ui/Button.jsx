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
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.99]';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-soft',
    secondary: 'bg-surface-100 hover:bg-surface-200 text-ink-900 border border-ink-200',
    outline: 'border border-ink-300 text-ink-900 hover:bg-surface-100',
    danger: 'bg-lost-600 hover:bg-lost-700 text-white shadow-soft',
    ghost: 'hover:bg-surface-100 text-ink-800',
    found: 'bg-found-600 hover:bg-found-700 text-white shadow-soft',
    lost: 'bg-lost-600 hover:bg-lost-700 text-white shadow-soft',
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
