import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-105 active:scale-95";
    
    const variantClasses = {
      primary: "bg-brand-accent text-white hover:bg-brand-accent-hover",
      secondary: "bg-brand-surface text-brand-primary hover:bg-opacity-80 border border-white/10",
      outline: "border-2 border-brand-accent bg-transparent hover:bg-brand-accent/10 text-brand-accent",
      ghost: "hover:bg-brand-accent/10 text-brand-accent",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} px-5 py-2.5 ${className || ''}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} {...props} className={`bg-brand-surface rounded-xl border border-white/10 shadow-lg ${className || ''}`}>
      {children}
    </div>
  )
);

Card.displayName = 'Card';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-lg border border-white/20 bg-brand-surface px-3 py-2 text-sm text-brand-primary transition-colors placeholder:text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    />
  )
);

Input.displayName = 'Input';

