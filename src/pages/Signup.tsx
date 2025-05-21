
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

const Testimonial = ({ name, content, rating = 5 }) => (
  <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
    <div className="flex items-center mb-2">
      <div className="flex space-x-0.5 text-yellow-500">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 mb-3 text-sm">{content}</p>
    <p className="font-medium text-gray-900">{name}</p>
  </div>
);

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!email || !password || !confirmPassword || !businessName) {
      setErrorMessage("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(email, password, businessName);
      // No need to navigate here, the useEffect will handle it
    } catch (error: any) {
      setErrorMessage(error.message || "Error creating account");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Signup Form */}
        <div className="w-full md:w-[45%] p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <img 
                src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" 
                alt="PP Protein" 
                className="h-10 mb-8" 
              />
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600">Join our wholesale program and get access to exclusive pricing</p>
            </div>

            {errorMessage && (
              <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#25a18e] hover:bg-[#1e8a77] mt-2" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-8">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-[#25a18e] hover:text-[#1e8a77] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Image and Testimonials */}
        <div className="hidden md:block md:w-[55%] bg-gradient-to-br from-[#f8f9fa] to-[#e2d1c3] relative">
          <div className="absolute inset-0 bg-[#25a18e]/10"></div>
          <div className="h-full overflow-y-auto p-10 relative z-10">
            <div className="max-w-lg mx-auto">
              <img 
                src="https://ppprotein.com.au/cdn/shop/files/PPP-Wholesale_1400x.png?v=1697533847" 
                alt="PP Protein Products" 
                className="w-full h-64 object-cover rounded-xl mb-8" 
              />
              
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Benefits of our wholesale program</h2>
              
              <Testimonial 
                name="Competitive Pricing" 
                content="Get exclusive access to special wholesale pricing, enabling you to maintain healthy profit margins while offering quality products to your customers."
              />
              
              <Testimonial 
                name="Quality Assurance" 
                content="All our protein products are made with premium ingredients and rigorously tested to ensure the highest standards of quality and taste."
              />
              
              <Testimonial 
                name="Reliable Support" 
                content="Our dedicated wholesale support team is always ready to assist with your orders, inquiries, and any special requirements you may have."
                rating={5}
              />
              
              <Testimonial 
                name="Flexible Ordering" 
                content="Order what you need, when you need it. Our minimum order quantities are designed to be accessible for businesses of all sizes."
                rating={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
