import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

