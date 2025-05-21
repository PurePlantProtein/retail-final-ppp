
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleCheckout = () => {
    // This is where we would integrate with Stripe/PayPal
    toast({
      title: "Checkout initiated",
      description: "This is where Stripe/PayPal integration would happen.",
    });
    // For demo purposes, we'll just show a success message and clear the cart
    toast({
      title: "Order placed successfully!",
      description: "Your order has been placed and will be processed soon.",
    });
    clearCart();
    navigate('/orders');
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-16">
              <p className="mb-6 text-gray-500">Please log in to view your cart</p>
              <div className="flex space-x-4">
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        
        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-16">
              <p className="mb-6 text-gray-500">Your cart is empty</p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <Card key={item.product.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <Link 
                        to={`/products/${item.product.id}`}
                        className="sm:w-1/4 flex-shrink-0"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-36 sm:h-full object-cover"
                        />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <Link 
                            to={`/products/${item.product.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.product.name}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-500"
                            onClick={() => handleRemoveItem(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 text-sm my-2 line-clamp-2">
                          {item.product.description}
                        </p>
                        
                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
                          <div className="flex items-center">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= item.product.minQuantity}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input 
                              type="text"
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value)) {
                                  handleQuantityChange(item.product.id, value);
                                }
                              }}
                              className="w-16 h-8 text-center mx-2"
                            />
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <p className="font-medium">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-72 h-fit">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    <CreditCard className="mr-2 h-4 w-4" /> Checkout
                  </Button>
                </CardFooter>
              </Card>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Secure checkout powered by Stripe & PayPal
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
