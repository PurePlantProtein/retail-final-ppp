
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SignupSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-gray-600">
            Thank you for registering with PPP Retailers
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">Pending Approval</span>
          </div>
          <p className="text-blue-700 text-sm">
            Your account is currently under review by our team. You'll receive an email notification once your account has been approved and you can access the dashboard.
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>What happens next?</strong>
          </p>
          <ul className="text-left space-y-1">
            <li>• Our team will review your application</li>
            <li>• You'll receive an email when approved</li>
            <li>• Once approved, you can access our wholesale pricing</li>
          </ul>
        </div>

        <div className="mt-8 space-y-3">
          <Button asChild className="w-full bg-[#25a18e] hover:bg-[#1e8a77]">
            <Link to="/login">
              Sign In
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Questions? Contact us at{' '}
            <a href="mailto:sales@ppprotein.com.au" className="text-[#25a18e] hover:underline">
              sales@ppprotein.com.au
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccess;
