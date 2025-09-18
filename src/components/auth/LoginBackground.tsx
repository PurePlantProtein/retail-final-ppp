
import React from 'react';

const LoginBackground = () => {
  return (
    <div 
      className="h-64 lg:h-full w-full bg-cover bg-center bg-no-repeat order-1 lg:order-2" 
      style={{
        backgroundImage: `url('/api/storage/assets/login-background')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '256px'
      }}
    />
  );
};

export default LoginBackground;
