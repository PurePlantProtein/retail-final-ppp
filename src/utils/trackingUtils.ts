
// Utility functions for automating tracking information

export const autoDetectCarrier = (trackingNumber: string): string | null => {
  if (!trackingNumber) return null;
  
  const cleanNumber = trackingNumber.replace(/\s/g, '').toUpperCase();
  
  // Australia Post patterns
  if (/^[A-Z]{2}\d{9}AU$/.test(cleanNumber) || /^[A-Z]{1}\d{10}$/.test(cleanNumber)) {
    return 'Australia Post';
  }
  
  // StarTrack patterns (similar to Australia Post but different format)
  if (/^CON\d{10}$/.test(cleanNumber) || /^[A-Z]{3}\d{8}$/.test(cleanNumber)) {
    return 'StarTrack';
  }
  
  // DHL patterns
  if (/^\d{10}$/.test(cleanNumber) || /^\d{11}$/.test(cleanNumber)) {
    return 'DHL';
  }
  
  // FedEx patterns
  if (/^\d{12}$/.test(cleanNumber) || /^\d{14}$/.test(cleanNumber)) {
    return 'FedEx';
  }
  
  // UPS patterns
  if (/^1Z[A-Z0-9]{16}$/.test(cleanNumber)) {
    return 'UPS';
  }
  
  // TNT patterns
  if (/^\d{9}$/.test(cleanNumber)) {
    return 'TNT';
  }
  
  // Toll/IPEC patterns
  if (/^[A-Z]{4}\d{10}$/.test(cleanNumber)) {
    return 'Toll';
  }
  
  return null;
};

export const generateTrackingUrl = (trackingNumber: string, carrier: string): string | null => {
  if (!trackingNumber || !carrier) return null;
  
  const cleanNumber = trackingNumber.replace(/\s/g, '');
  
  switch (carrier) {
    case 'Australia Post':
      return `https://auspost.com.au/mypost/track/#/details/${cleanNumber}`;
    
    case 'StarTrack':
      return `https://www.startrack.com.au/track-trace/?id=${cleanNumber}`;
    
    case 'DHL':
      return `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${cleanNumber}`;
    
    case 'FedEx':
      return `https://www.fedex.com/fedextrack/?tracknumber=${cleanNumber}`;
    
    case 'UPS':
      return `https://www.ups.com/track?tracknum=${cleanNumber}`;
    
    case 'TNT':
      return `https://www.tnt.com/express/en_au/site_tools/tracking.html?searchType=con&cons=${cleanNumber}`;
    
    case 'Toll':
      return `https://www.tollgroup.com/track-trace?trackingNumber=${cleanNumber}`;
    
    case 'Aramex':
      return `https://www.aramex.com/au/track/results?ShipmentNumber=${cleanNumber}`;
    
    default:
      return null;
  }
};

export const getEstimatedDeliveryDate = (carrier: string): string | null => {
  const today = new Date();
  let deliveryDays = 3; // Default 3 business days
  
  switch (carrier) {
    case 'Australia Post':
      deliveryDays = 3; // Express Post
      break;
    case 'StarTrack':
      deliveryDays = 2; // Express service
      break;
    case 'DHL':
      deliveryDays = 1; // Express
      break;
    case 'FedEx':
      deliveryDays = 1; // Express
      break;
    case 'UPS':
      deliveryDays = 1; // Express
      break;
    case 'TNT':
      deliveryDays = 2; // Express
      break;
    case 'Toll':
      deliveryDays = 3; // Standard
      break;
    case 'Aramex':
      deliveryDays = 2; // Express
      break;
    default:
      deliveryDays = 3;
  }
  
  // Calculate delivery date (excluding weekends)
  const deliveryDate = new Date(today);
  let addedDays = 0;
  
  while (addedDays < deliveryDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return deliveryDate.toISOString().split('T')[0];
};

export const validateTrackingNumber = (trackingNumber: string, carrier: string): boolean => {
  if (!trackingNumber || !carrier) return false;
  
  const cleanNumber = trackingNumber.replace(/\s/g, '').toUpperCase();
  const detectedCarrier = autoDetectCarrier(trackingNumber);
  
  // If we can detect a carrier and it matches, it's likely valid
  if (detectedCarrier === carrier) {
    return true;
  }
  
  // Basic length and format validation for each carrier
  switch (carrier) {
    case 'Australia Post':
      return cleanNumber.length >= 10 && cleanNumber.length <= 13;
    case 'StarTrack':
      return cleanNumber.length >= 10 && cleanNumber.length <= 13;
    case 'DHL':
      return cleanNumber.length >= 10 && cleanNumber.length <= 11;
    case 'FedEx':
      return cleanNumber.length >= 12 && cleanNumber.length <= 14;
    case 'UPS':
      return cleanNumber.length === 18 && cleanNumber.startsWith('1Z');
    case 'TNT':
      return cleanNumber.length === 9;
    case 'Toll':
      return cleanNumber.length >= 10;
    case 'Aramex':
      return cleanNumber.length >= 8;
    default:
      return cleanNumber.length >= 8; // Minimum reasonable length
  }
};
