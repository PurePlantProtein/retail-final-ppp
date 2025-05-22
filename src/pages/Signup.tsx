import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShippingAddress } from '@/types/product';
import { useShipping } from '@/contexts/ShippingContext';

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

// Australian states
const AUS_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' }
];

// Business types
const BUSINESS_TYPES = [
  "Gym",
  "Health Store",
  "Online Store",
  "Nutrition Shop",
  "Fitness Center",
  "Pharmacy",
  "Other"
];

const Signup = () => {
  // Form data states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  
  // Shipping address states
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signup, user } = useAuth();
  const { setShippingAddress } = useShipping();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/products');
    }
  }, [user, navigate]);

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    
    if (step === 1) {
      if (!email || !password || !confirmPassword || !businessName) {
        setErrorMessage("Please fill in all fields");
        return false;
      }
      
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return false;
      }
      
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return false;
      }
      
      return true;
    } 
    else if (step === 2) {
      if (!businessType) {
        setErrorMessage("Please select a business type");
        return false;
      }
      
      return true;
    }
    else if (step === 3) {
      if (!name || !street || !city || !state || !postalCode || !phone) {
        setErrorMessage("Please fill in all address fields");
        return false;
      }
      
      // Very basic Australian postal code validation
      if (!/^\d{4}$/.test(postalCode)) {
        setErrorMessage("Postal code must be 4 digits");
        return false;
      }
      
      // Very basic Australian phone validation
      if (!/^(?:\+61|0)[2-478](?:[ -]?[0-9]){8}$/.test(phone)) {
        setErrorMessage("Please enter a valid Australian phone number");
        return false;
      }
      
      return true;
    }
    
    return false;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setErrorMessage(null);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    
    try {
      // Create the shipping address object
      const shippingData: ShippingAddress = {
        name,
        street,
        city,
        state,
        postalCode,
        country: 'Australia',
        phone
      };
      
      // Sign up the user
      await signup(email, password, businessName, businessType);
      
      // Save shipping address
      setShippingAddress(shippingData);
      
      // No need to navigate here, the useEffect will handle it
    } catch (error: any) {
      setErrorMessage(error.message || "Error creating account");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
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
          </>
        );
      case 2:
        return (
          <div>
            <Label htmlFor="businessType" className="text-sm font-medium">Business Type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">This helps us tailor our services to your business needs</p>
          </div>
        );
      case 3:
        return (
          <>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Contact Name</Label>
              <Input
                id="name"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
              <Input
                id="street"
                placeholder="123 Business St"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium">City/Suburb</Label>
                <Input
                  id="city"
                  placeholder="Sydney"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="state" className="text-sm font-medium">State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUS_STATES.map((st) => (
                      <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="2000"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  placeholder="04XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="country" className="text-sm font-medium">Country</Label>
              <Input
                id="country"
                value="Australia"
                disabled
                className="mt-1 bg-gray-50"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step 
                  ? 'bg-[#25a18e] text-white' 
                  : step < currentStep 
                    ? 'bg-[#25a18e]/20 text-[#25a18e]' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div className={`h-1 w-12 ${
                step < currentStep ? 'bg-[#25a18e]/50' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Account Details";
      case 2:
        return "Business Information";
      case 3:
        return "Shipping Address";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left side - Signup Form */}
        <div className="w-full md:w-[45%] p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <img 
                src="https://www.ppprotein.com.au/cdn/shop/files/PPPlogo-bold.svg?v=1731701457&width=200" 
                alt="PP Protein" 
                className="h-10 mb-8" 
              />
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-600 mb-4">Join our wholesale program and get access to exclusive pricing</p>
              
              {renderStepIndicator()}
              <h2 className="text-xl font-medium mb-4">{renderStepTitle()}</h2>
            </div>

            {errorMessage && (
              <div className="p-3 text-white bg-[#ff4d6d] rounded-md text-sm mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {renderStepContent()}
              
              <div className="flex gap-3 justify-between mt-6">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handlePrevStep}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    className={`bg-[#25a18e] hover:bg-[#1e8a77] ${currentStep === 1 && 'flex-1'}`}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-[#25a18e] hover:bg-[#1e8a77] flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                )}
              </div>
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
                src="/lovable-uploads/ca77458f-0931-4215-a7c7-151ddc81bd55.png" 
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
