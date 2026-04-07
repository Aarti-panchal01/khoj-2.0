const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-surface-100 text-ink-700 border border-ink-200',
    primary: 'bg-primary-50 text-primary-800 border border-primary-200',
    success: 'bg-success-50 text-success-700 border border-success-100',
    warning: 'bg-warning-50 text-warning-800 border border-warning-100',
    danger: 'bg-danger-50 text-danger-700 border border-danger-100',
    found: 'bg-emerald-100 text-emerald-800',
    lost: 'bg-rose-100 text-rose-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
