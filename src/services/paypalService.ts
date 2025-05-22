
// This file is kept for backward compatibility but PayPal functionality has been removed

export interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
}

// These functions are kept as stubs for backward compatibility
export const loadPayPalScript = (_clientId: string): Promise<void> => {
  console.warn('PayPal integration has been disabled');
  return Promise.resolve();
};

export const initPayPalButton = (
  _containerId: string, 
  _amount: number,
  _onApprove: (data: any) => void,
  _onError: (err: any) => void
): void => {
  console.warn('PayPal integration has been disabled');
};

// Type declaration for PayPal SDK - kept for backward compatibility
declare global {
  interface Window {
    paypal: any;
  }
}
