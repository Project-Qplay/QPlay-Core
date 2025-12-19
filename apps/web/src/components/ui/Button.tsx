import React, { useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'quantum';
  size?: 'sm' | 'md' | 'lg';
  soundType?: 'click' | 'success' | 'error' | 'quantum';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  soundType = 'click',
  children,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const { playSound, settings } = useSettings();
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      playSound(soundType);
      onClick?.(e);

      // Ripple effect
      const button = btnRef.current;
      if (button) {
        const ripple = document.createElement('span');
        ripple.className = 'button-ripple';
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => {
          ripple.remove();
        });
      }
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    }

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white';
        case 'secondary':
          return 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 text-white';
        case 'success':
          return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white';
        case 'danger':
          return 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white';
        case 'quantum':
          return 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 text-white';
        default:
          return 'bg-gray-600 hover:bg-gray-500 text-white';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'md':
          return 'px-4 py-2';
        case 'lg':
          return 'px-6 py-3 text-lg';
        default:
          return 'px-4 py-2';
      }
    };

    const animationClasses = settings.animations
      ? 'transition-all duration-200 transform hover:scale-105'
      : '';

    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${animationClasses}
        rounded-xl font-semibold
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${className}
      `}
        {...props}
      >
        {children}
      </button>
    );
  }
};
