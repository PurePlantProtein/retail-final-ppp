
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No users found matching your criteria.</p>
    </div>
  );
};

export default EmptyState;
