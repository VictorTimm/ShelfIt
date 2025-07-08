'use client';

import { useState } from 'react';
import { Item } from '../lib/types';
import { updateItemAgreement } from '../lib/storage';

interface PendingAgreementsProps {
  items: Item[];
  onUpdate: () => void;
}

export default function PendingAgreements({ items, onUpdate }: PendingAgreementsProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAgreement = async (itemId: string, status: 'accepted' | 'rejected') => {
    setProcessing(itemId);
    setError(null);

    try {
      const result = await updateItemAgreement(itemId, status);
      if (result.success) {
        onUpdate();
      } else {
        setError(result.error || 'Failed to update agreement');
      }
    } catch (err) {
      setError('An error occurred while updating the agreement');
    } finally {
      setProcessing(null);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Pending Agreements</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{item.item_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.type === 'borrowed' ? 'Borrowed from' : 'Lent to'} {item.person}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Date: {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAgreement(item.id, 'accepted')}
                  disabled={!!processing}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {processing === item.id ? 'Processing...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleAgreement(item.id, 'rejected')}
                  disabled={!!processing}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {processing === item.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 