import React from 'react';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonGroupItemProps {
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`} role="group">
    {children}
  </div>
);

export const ButtonGroupItem: React.FC<ButtonGroupItemProps> = ({
  icon,
  onClick,
  disabled,
  children,
  variant = 'secondary'
}) => (
  <Button
    icon={icon}
    onClick={onClick}
    disabled={disabled}
    variant={variant}
  >
    {children}
  </Button>
);