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
    whileHover: { y: -6, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)' },
    transition: { duration: 0.3, ease: 'easeOut' }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-2xl border border-gray-100 shadow-sm
        ${hover ? 'cursor-pointer hover:border-blue-200' : ''}
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
