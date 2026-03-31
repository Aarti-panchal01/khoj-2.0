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
<<<<<<< HEAD
    whileHover: { y: -2, boxShadow: '0 8px 20px -6px rgb(15 23 42 / 0.16), 0 4px 8px -4px rgb(15 23 42 / 0.12)' },
=======
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`
<<<<<<< HEAD
        bg-white rounded-2xl border border-slate-200 shadow-soft
=======
        bg-white rounded-xl border border-gray-200 shadow-sm
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
        ${hover ? 'cursor-pointer' : ''}
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
