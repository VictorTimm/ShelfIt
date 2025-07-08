'use client';

import { useState } from 'react';
import { ItemCategory } from '../lib/types';

interface ItemFiltersProps {
  selectedType: 'all' | 'borrowed' | 'lent';
  onTypeChange: (type: 'all' | 'borrowed' | 'lent') => void;
  returnedFilter: 'all' | 'active' | 'returned';
  onReturnedFilterChange: (filter: 'all' | 'active' | 'returned') => void;
}

export default function ItemFilters({
  selectedType,
  onTypeChange,
  returnedFilter,
  onReturnedFilterChange,
}: ItemFiltersProps) {
  return (
    <div className="flex gap-4">
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value as 'all' | 'borrowed' | 'lent')}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="all">All Items</option>
        <option value="borrowed">Borrowed</option>
        <option value="lent">Lent</option>
      </select>

      <select
        value={returnedFilter}
        onChange={(e) => onReturnedFilterChange(e.target.value as 'all' | 'active' | 'returned')}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="returned">Returned</option>
      </select>
    </div>
  );
} 