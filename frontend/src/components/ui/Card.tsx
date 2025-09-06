import React from 'react';
import { cn } from '@/lib/utils';
import { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800',
        hover && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
