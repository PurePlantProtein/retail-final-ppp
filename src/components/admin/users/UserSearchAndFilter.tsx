
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserSearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const UserSearchAndFilter: React.FC<UserSearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="retailers">Retailers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UserSearchAndFilter;
