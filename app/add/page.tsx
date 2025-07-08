'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addItem } from '../lib/storage';
import { NewItem, ItemCategory } from '../lib/types';
import { useAuth } from '../components/AuthProvider';

export default function AddItemPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed');

  console.log('AddItemPage state:', { user, authLoading, saving, error });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');

    if (!user) {
      console.error('No user found');
      setError('You must be logged in to add items');
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData(e.currentTarget);
      const newItem: NewItem = {
        item_name: formData.get('itemName') as string,
        person: formData.get('person') as string,
        date: formData.get('date') as string,
        type: formData.get('type') as 'borrowed' | 'lent',
        category: formData.get('category') as ItemCategory,
        returned: false,
        notes: formData.get('notes') as string || undefined,
        reminder_date: formData.get('reminderDate') as string || undefined,
        agreement_status: 'pending',
        borrower_email: type === 'lent' ? formData.get('borrowerEmail') as string : user.email!
      };

      console.log('Adding item:', newItem);
      const result = await addItem(newItem);
      console.log('Add item result:', result);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError('Failed to add item. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Item Name
          </label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <select
            id="type"
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value as 'borrowed' | 'lent')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="borrowed">Borrowed</option>
            <option value="lent">Lent</option>
          </select>
        </div>

        <div>
          <label htmlFor="person" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Person
          </label>
          <input
            type="text"
            id="person"
            name="person"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {type === 'lent' && (
          <div>
            <label htmlFor="borrowerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Borrower's Email
            </label>
            <input
              type="email"
              id="borrowerEmail"
              name="borrowerEmail"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The borrower will receive a notification to confirm this item.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue="Other"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          <label htmlFor="reminderDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reminder Date (Optional)
          </label>
          <input
            type="date"
            id="reminderDate"
            name="reminderDate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || !user}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Adding...' : type === 'lent' ? 'Send Agreement' : 'Request Agreement'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-4">{error}</div>
        )}
      </form>
    </div>
  );
} 