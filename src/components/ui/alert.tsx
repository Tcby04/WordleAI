import React from 'react';
import { cn } from "../../lib/utils"

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  title, 
  children, 
  variant = 'default',
  className
}) => {
  const baseStyles = "p-4 rounded-lg border";
  const variantStyles = {
    default: "bg-purple-800 border-purple-600 text-white",
    destructive: "bg-red-800 border-red-600 text-white"
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} role="alert">
      {title && <h5 className="font-medium mb-2">{title}</h5>}
      <div>{children}</div>
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="font-medium mb-2">{children}</h5>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);