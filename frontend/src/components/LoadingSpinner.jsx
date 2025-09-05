import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-crypto-blue border-t-transparent rounded-full animate-spin`}
      ></div>
      {message && <p className="text-gray-400 text-sm animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
