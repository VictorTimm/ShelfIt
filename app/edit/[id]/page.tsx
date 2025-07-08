'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item, ItemCategory } from '../../lib/types';
import { getItem, updateItem, deleteItem } from '../../lib/storage';
import { useAuth } from '../../components/AuthProvider';

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    if (!user) {
      router.push('/');
      return;
    }

    const data = await getItem(params.id);
    if (!data) {
      router.push('/');
      return;
    }

    setItem(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item) return;

    setSaving(true);
    setError(null);

    try {
      const result = await updateItem(item.id, {
        item_name: item.item_name,
        person: item.person,
        date: item.date,
        type: item.type,
        reminder_date: item.reminder_date,
        notes: item.notes,
        category: item.category
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to update item');
      }
    } catch (err) {
      setError('An error occurred while updating the item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteItem(item.id);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to delete item');
        setIsDeleting(false);
      }
    } catch (err) {
      setError('An error occurred while deleting the item');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  // Only show delete button if user is the lender and agreement is pending
  const canDelete = user?.id === item.lender_id && item.agreement_status === 'pending';

  return (
    <main className="container mx-auto px-4 py-8 max-w-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Item</h1>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Item Name
          </label>
          <input
            type="text"
            value={item.item_name}
            onChange={(e) => setItem({ ...item, item_name: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Person
          </label>
          <input
            type="text"
            value={item.person}
            onChange={(e) => setItem({ ...item, person: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Date
          </label>
          <input
            type="date"
            value={item.date}
            onChange={(e) => setItem({ ...item, date: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Type
          </label>
          <select
            value={item.type}
            onChange={(e) => setItem({ ...item, type: e.target.value as 'borrowed' | 'lent' })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="borrowed">Borrowed</option>
            <option value="lent">Lent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Category
          </label>
          <select
            value={item.category}
            onChange={(e) => setItem({ ...item, category: e.target.value as ItemCategory })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="Money">Money</option>
            <option value="Book">Book</option>
            <option value="Clothing">Clothing</option>
            <option value="Device">Device</option>
            <option value="Tool">Tool</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Reminder Date (Optional)
          </label>
          <input
            type="date"
            value={item.reminder_date || ''}
            onChange={(e) => setItem({ ...item, reminder_date: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={item.notes || ''}
            onChange={(e) => setItem({ ...item, notes: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 min-h-[100px]"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
} 