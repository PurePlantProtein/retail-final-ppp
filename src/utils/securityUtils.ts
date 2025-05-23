
/**
 * Update the favicon dynamically
 */
export const updateFavicon = (imageUrl: string) => {
  try {
    if (!imageUrl) return;
    
    // Find existing favicon link or create a new one
    let favicon: HTMLLinkElement | null = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      document.head.appendChild(favicon);
    }
    
    favicon.href = imageUrl;
    
    console.log('Favicon updated successfully:', imageUrl);
  } catch (error) {
    console.error('Error updating favicon:', error);
  }
};

/**
 * Security utility to sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  // This is a very basic implementation
  // For production, use a proper library like DOMPurify
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Check if an image URL is valid
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common image extensions
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = url.split('.').pop()?.toLowerCase();
  
  return !!extension && imageExtensions.includes(extension);
};

/**
 * Session timeout (30 minutes in milliseconds)
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Check if a session is expired based on last activity timestamp
 */
export const isSessionExpired = (lastActivityTimestamp: number): boolean => {
  const currentTime = Date.now();
  const inactiveTime = currentTime - lastActivityTimestamp;
  
  return inactiveTime > SESSION_TIMEOUT_MS;
};

/**
 * Generate a secure reference code for orders
 */
export const generateSecureOrderReference = (): string => {
  // Create a random string with timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  return `REF-${timestamp}-${randomPart}`;
};
