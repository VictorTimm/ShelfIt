'use client';

import React, { useState } from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';
import { Item } from '../lib/types';
import { useRouter } from 'next/navigation';
import { updateItem } from '../lib/storage';

interface ItemCardProps {
  item: Item;
  onMarkAsReturned: (itemId: string, currentStatus: boolean) => void;
}

export default function ItemCard({ item, onMarkAsReturned }: ItemCardProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleReturned = async () => {
    try {
      setUpdating(true);
      setError(null);
      const result = await updateItem(item.id, { returned: !item.returned });
      if (result.success) {
        onMarkAsReturned(item.id, item.returned);
      } else {
        setError(result.error || 'Failed to update item');
      }
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  const isReminderSoon = () => {
    if (!item.reminder_date) return false;
    const reminderDate = new Date(item.reminder_date);
    const today = new Date();
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  };

  const showReminder = item.reminder_date && !item.returned &&
    new Date(item.reminder_date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Money':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Book':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Clothing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Device':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Tool':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4 relative">
      {showReminder && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-t-lg">
          Due in less than 2 days!
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold mb-2">{item.item_name}</h3>
          <p className="text-gray-600 dark:text-gray-300">{item.person}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(item.date), 'MMMM d, yyyy')}
          </p>
          {item.reminder_date && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reminder: {format(new Date(item.reminder_date), 'MMMM d, yyyy')}
            </p>
          )}
          {item.notes && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">{item.notes}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
            {item.category}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.returned
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
          }`}>
            {item.returned ? 'Returned' : 'Active'}
          </span>
          <Link
            href={`/edit/${item.id}`}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:opacity-80 transition-opacity text-center"
          >
            Edit
          </Link>
          <button
            onClick={handleToggleReturned}
            disabled={updating}
            className={`px-4 py-2 rounded-md ${
              updating
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {updating ? 'Updating...' : item.returned ? 'Mark as Active' : 'Mark as Returned'}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-4 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
}