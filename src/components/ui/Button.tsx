import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg',
        outline: 'border border-purple-200 bg-white/70 text-gray-700 hover:bg-purple-50',
        ghost: 'text-gray-600 hover:bg-purple-50',
        secondary: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 hover:from-purple-100 hover:to-pink-100',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 py-1',
        lg: 'h-12 px-8 py-3',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
