'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Item } from '../lib/types';
import { updateItem, deleteItem } from '../lib/storage';
import { useAuth } from '../components/AuthProvider';

interface ItemCardProps {
  item: Item;
  onUpdate: () => void;
}

export default function ItemCard({ item, onUpdate }: ItemCardProps) {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleMarkAsReturned = async () => {
    setUpdating(true);
    setError(null);

    try {
      const result = await updateItem(item.id, { returned: !item.returned });
      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || 'Failed to update item');
      }
    } catch (err) {
      setError('An error occurred while updating the item');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);
    console.log('Starting delete for item:', item.id);

    try {
      const result = await deleteItem(item.id);
      console.log('Delete result:', result);
      
      if (result.success) {
        console.log('Delete successful, calling onUpdate');
        // Force immediate UI update by hiding this item
        const itemElement = document.getElementById(`item-${item.id}`);
        if (itemElement) {
          itemElement.style.display = 'none';
        }
        // Then refresh the data
        setTimeout(() => {
          onUpdate();
        }, 100);
      } else {
        console.error('Delete failed:', result.error);
        setError(result.error || 'Failed to delete item');
        setDeleting(false);
      }
    } catch (err) {
      console.error('Error in delete operation:', err);
      setError('An error occurred while deleting the item');
      setDeleting(false);
    }
  };

  return (
    <div id={`item-${item.id}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{item.item_name}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {item.type === 'borrowed' ? 'Borrowed from' : 'Lent to'} {item.person}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(item.date).toLocaleDateString()}
          </p>
          {item.reminder_date && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Reminder: {new Date(item.reminder_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-sm px-2 py-1 rounded ${
            item.returned
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
          }`}>
            {item.returned ? 'Returned' : 'Active'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {item.category}
          </span>
        </div>
      </div>

      {item.notes && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {item.notes}
        </p>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <Link
          href={`/edit/${item.id}`}
          className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
        >
          Edit
        </Link>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
        
        <button
          onClick={handleMarkAsReturned}
          disabled={updating}
          className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {updating ? 'Updating...' : item.returned ? 'Mark as Active' : 'Mark as Returned'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}