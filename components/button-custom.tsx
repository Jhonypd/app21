import { Button } from './ui/button';
import React from 'react';

interface ButtonCustomProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'hero'
    | 'admin'
    | 'warning';
  size: 'default' | 'sm' | 'lg' | 'icon';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function ButtonCustom({
  icon,
  variant,
  size = 'default',
  children,
  ...props
}: ButtonCustomProps) {
  return (
    <Button
      {...props}
      className="flex items-center"
      variant={variant}
      size={size}
    >
      {icon}
      {children}
    </Button>
  );
}
