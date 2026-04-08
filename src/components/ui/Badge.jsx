import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'default', className = '', animated = false }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border border-gray-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    found: 'bg-green-100 text-green-700 border border-green-300',
    lost: 'bg-red-100 text-red-600 border border-red-300',
  };

  const Component = animated ? motion.span : 'span';
  const motionProps = animated ? {
    whileHover: { scale: 1.05, y: -2 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-sm ${variants[variant]} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Badge;
