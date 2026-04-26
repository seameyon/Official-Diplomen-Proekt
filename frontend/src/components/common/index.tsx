import { cn } from '../../utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const Loading = ({ size = 'md', className, text }: LoadingProps) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'border-primary-200 border-t-primary-600 rounded-full animate-spin',
          sizes[size]
        )}
      />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const Spinner = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin',
      className
    )}
  />
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover = false, onClick }: CardProps) => (
  <div
    className={cn(
      'bg-card-light dark:bg-card-dark',
      'rounded-3xl shadow-card dark:shadow-card-dark',
      'transition-all duration-300',
      hover && 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar = ({ src, alt, fallback, size = 'md', className }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        'bg-gradient-to-br from-primary-400 to-accent-500',
        'text-white font-semibold',
        'ring-2 ring-primary-200 dark:ring-primary-800',
        sizes[size],
        className
      )}
    >
      {fallback || '?'}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

interface DividerProps {
  className?: string;
  text?: string;
}

export const Divider = ({ className, text }: DividerProps) => {
  if (text) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className={cn('h-px bg-gray-200 dark:bg-gray-700', className)} />
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
    {icon && (
      <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">{icon}</div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className, variant = 'rectangular', width, height }: SkeletonProps) => {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, action, className }: PageHeaderProps) => (
  <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8', className)}>
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-display">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);
