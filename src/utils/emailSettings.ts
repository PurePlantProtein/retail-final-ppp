
import { EmailSettings } from '@/types/cart';

// Default email settings
export const defaultEmailSettings: EmailSettings = {
  adminEmail: 'sales@ppprotein.com.au',
  dispatchEmail: '',
  accountsEmail: '',
  notifyAdmin: true,
  notifyDispatch: false,
  notifyAccounts: false,
  notifyCustomer: true,
  customerTemplate: '',
  adminTemplate: '',
  dispatchTemplate: '',
  accountsTemplate: '',
  trackingTemplate: ''
};

export const loadEmailSettings = (): EmailSettings => {
  const savedSettings = localStorage.getItem('emailSettings');
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings);
    } catch (e) {
      console.error('Failed to parse email settings', e);
      localStorage.removeItem('emailSettings');
    }
  }
  return defaultEmailSettings;
};

export const saveEmailSettings = (settings: EmailSettings): void => {
  localStorage.setItem('emailSettings', JSON.stringify(settings));
};
