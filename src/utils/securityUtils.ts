
// Session timeout configuration
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// Check if the user's session has expired based on their last activity timestamp
export const isSessionExpired = (lastActivityTimestamp: number): boolean => {
  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTimestamp;
  return timeSinceLastActivity > SESSION_TIMEOUT_MS;
};

// Update the favicon with a new icon URL
export const updateFavicon = (iconUrl: string | null): void => {
  if (!iconUrl) return;
  
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'shortcut icon';
  link.href = iconUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
  
  // Save to localStorage for persistence
  localStorage.setItem('site_icon', iconUrl);
};
