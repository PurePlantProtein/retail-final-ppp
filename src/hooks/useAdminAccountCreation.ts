
import { useEffect, useState } from 'react';

// Disabled admin account creation to prevent repeated signup attempts
// This was causing 422 errors and React render issues
export const useAdminAccountCreation = () => {
  // Hook is disabled but kept for compatibility
  console.log('Admin account creation hook is disabled to prevent startup errors');
};
