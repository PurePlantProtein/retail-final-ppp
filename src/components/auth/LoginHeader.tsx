
import React from 'react';

const LoginHeader = () => {
  return (
    <div className="mb-10">
      <img 
        src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" 
        alt="PP Protein" 
        className="h-10 mb-8" 
      /> 
      <h1 className="text-3xl font-bold mb-2">Sign in to your account</h1>
      <p className="text-gray-600">Enter your details below to access your wholesale account</p>
    </div>
  );
};

export default LoginHeader;
