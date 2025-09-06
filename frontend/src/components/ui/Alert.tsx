import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
      icon: CheckCircle,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
      icon: AlertCircle,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
      icon: AlertCircle,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
      icon: Info,
    },
  };

  const Icon = variants[variant].icon;

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variants[variant].container,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className="inline-flex rounded-md p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
