
// Security utility functions for the application

// Function to sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if password meets minimum security requirements
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Generate a random order reference for increased security
export const generateSecureOrderReference = (): string => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD-${timestamp}-${random}`;
};

// Limit order attempts to prevent brute force attacks
const attemptTracker: Record<string, { count: number, timestamp: number }> = {};

export const checkRateLimit = (userId: string, action: string, limit = 5, timeWindowMs = 60000): boolean => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(attemptTracker).forEach(k => {
    if (now - attemptTracker[k].timestamp > timeWindowMs) {
      delete attemptTracker[k];
    }
  });
  
  // Check if user has an entry
  if (!attemptTracker[key]) {
    attemptTracker[key] = { count: 1, timestamp: now };
    return true;
  }
  
  // Check if within time window
  if (now - attemptTracker[key].timestamp <= timeWindowMs) {
    // Check if over limit
    if (attemptTracker[key].count >= limit) {
      return false; // Rate limited
    } else {
      attemptTracker[key].count += 1;
      return true;
    }
  } else {
    // Reset if outside time window
    attemptTracker[key] = { count: 1, timestamp: now };
    return true;
  }
};

// Session timeout duration in milliseconds (15 minutes)
export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

// Check if session should be considered inactive
export const isSessionExpired = (lastActivityTimestamp: number): boolean => {
  return Date.now() - lastActivityTimestamp > SESSION_TIMEOUT_MS;
};
