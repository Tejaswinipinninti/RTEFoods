import { classNames } from '../../utils/helpers';

const Badge = ({ variant = 'info', children, size = 'md' }) => {
  const variantClasses = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    primary: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full font-medium border',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
