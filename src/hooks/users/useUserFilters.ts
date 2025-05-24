
import { useState, useCallback, useMemo } from 'react';

export const useUserFilters = (users: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all-users');

  // Get filtered users based on search term and active tab
  const getFilteredUsers = useCallback(() => {
    return users.filter(user => {
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tab
      let matchesTab = true;
      if (activeTab === 'retailers') {
        matchesTab = user.isRetailer;
      } else if (activeTab === 'distributors') {
        matchesTab = user.isDistributor;
      } else if (activeTab === 'admins') {
        matchesTab = user.isAdmin;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    getFilteredUsers
  };
};
