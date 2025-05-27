
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface LoginErrorMessageProps {
  message: string;
}

const LoginErrorMessage: React.FC<LoginErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm mb-4 flex items-start gap-2">
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default LoginErrorMessage;
