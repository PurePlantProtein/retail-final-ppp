
import React from 'react';

const LoginBackground = () => {
  return (
    <div 
      className="h-64 lg:h-auto w-full lg:w-[55%] bg-cover bg-center bg-no-repeat order-1 lg:order-2" 
      style={{
        backgroundImage: `url('/lovable-uploads/e8d0fa9a-8140-44aa-8386-93b48950ecc1.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '256px'
      }}
    />
  );
};

export default LoginBackground;
