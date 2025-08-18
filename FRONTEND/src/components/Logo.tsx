import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <img 
      src="/logomark.png"
      alt="UniConnect Logo"
      className={className}
      style={{ 
        width: size, 
        height: size,
        objectFit: 'contain'
      }}
    />
  );
};

export default Logo;
