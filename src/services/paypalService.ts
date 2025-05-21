
// PayPal Service for handling PayPal payments
export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
}

// This function loads the PayPal SDK script
export const loadPayPalScript = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if the script is already loaded
    if (document.querySelector('script[data-namespace="paypal-sdk"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.setAttribute('data-namespace', 'paypal-sdk');
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    document.body.appendChild(script);
  });
};

// This function initializes a PayPal button in a container
export const initPayPalButton = (
  containerId: string, 
  amount: number,
  onApprove: (data: any) => void,
  onError: (err: any) => void
): void => {
  if (!window.paypal) {
    console.error('PayPal SDK is not loaded yet');
    return;
  }

  // Clear any existing buttons
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
    
    // Initialize the PayPal button
    window.paypal.Buttons({
      // Configure the button
      style: {
        color: 'blue',
        shape: 'rect',
        label: 'pay',
        height: 40
      },
      
      // Set up the transaction
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toFixed(2)
            }
          }]
        });
      },
      
      // Handle approved transactions
      onApprove: async (data: any, actions: any) => {
        // Capture the funds from the transaction
        const details = await actions.order.capture();
        onApprove({ details, orderID: data.orderID });
      },
      
      // Handle errors
      onError: (err: any) => {
        console.error('PayPal Error:', err);
        onError(err);
      }
    }).render(`#${containerId}`);
  }
};

// Type declaration for PayPal SDK
declare global {
  interface Window {
    paypal: any;
  }
}
