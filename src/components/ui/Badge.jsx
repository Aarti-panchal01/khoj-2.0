const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
<<<<<<< HEAD
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-primary-50 text-primary-700 border border-primary-200',
    success: 'bg-success-50 text-success-700 border border-success-100',
    warning: 'bg-warning-50 text-warning-700 border border-warning-100',
    danger: 'bg-danger-50 text-danger-700 border border-danger-100',
    found: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    lost: 'bg-rose-50 text-rose-700 border border-rose-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
=======
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    found: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
>>>>>>> 3eef910c89604cd45d0862cdab7cb921277dd20b
      {children}
    </span>
  );
};

export default Badge;
