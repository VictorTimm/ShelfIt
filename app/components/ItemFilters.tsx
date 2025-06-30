'use client';

import { useState } from 'react';
import { ItemCategory } from '../lib/types';

interface ItemFiltersProps {
  selectedType: string;
  selectedStatus: string;
  selectedCategory: string;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
}

export default function ItemFilters({
  selectedType,
  selectedStatus,
  selectedCategory,
  onTypeChange,
  onStatusChange,
  onCategoryChange,
}: ItemFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <option value="All">All Types</option>
        <option value="Borrowed">Borrowed</option>
        <option value="Lent">Lent</option>
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <option value="All">All Status</option>
        <option value="Active">Active</option>
        <option value="Returned">Returned</option>
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      >
        <option value="All">All Categories</option>
        <option value="Money">Money</option>
        <option value="Book">Book</option>
        <option value="Clothing">Clothing</option>
        <option value="Device">Device</option>
        <option value="Tool">Tool</option>
        <option value="Other">Other</option>
      </select>
    </div>
  );
} 