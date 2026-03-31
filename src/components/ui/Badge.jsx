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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
