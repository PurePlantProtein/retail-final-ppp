
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardFooter, 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state?.orderDetails;

  // Redirect to home if accessed directly without order details
  useEffect(() => {
    if (!orderDetails) {
      navigate('/');
    }
  }, [orderDetails, navigate]);

  if (!orderDetails) {
    return null; // Will redirect due to the effect
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Card className="border-green-100 shadow-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto my-4 bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Order Successfully Placed</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase! Your order has been received.
            </p>
            
            <div className="border rounded-md p-4 mb-6 bg-gray-50 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-medium">{orderDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date(orderDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium">${orderDetails.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">
                    {orderDetails.paymentMethod.replace('-', ' ')}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-2">
              We've sent a confirmation email to the address on file.
            </p>
            <p className="text-gray-600">
              You can check the status of your order at any time in the "Orders" section of your account.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center pb-6">
            <Button asChild>
              <Link to="/orders">View Your Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
