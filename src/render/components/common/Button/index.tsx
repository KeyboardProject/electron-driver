import React from 'react';
import './styles.scss';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => (
  <button 
    className={`button button--${variant} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {text}
  </button>
);

export default Button; 