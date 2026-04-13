import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      tap-highlight
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-primary-500 to-primary-600 text-white
        hover:from-primary-600 hover:to-primary-700 hover:shadow-glow
        focus:ring-primary-500
      `,
      secondary: `
        bg-gradient-to-r from-secondary-500 to-secondary-600 text-white
        hover:from-secondary-600 hover:to-secondary-700
        focus:ring-secondary-500
      `,
      accent: `
        bg-gradient-to-r from-accent-500 to-accent-600 text-white
        hover:from-accent-600 hover:to-accent-700
        focus:ring-accent-500
      `,
      outline: `
        border-2 border-primary-500 text-primary-600 dark:text-primary-400
        hover:bg-primary-50 dark:hover:bg-primary-950
        focus:ring-primary-500
      `,
      ghost: `
        text-gray-700 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:ring-gray-400
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white
        hover:from-red-600 hover:to-red-700
        focus:ring-red-500
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg rounded-3xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
