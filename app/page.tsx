'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Item } from './lib/types';
import { getAllItems, updateItem } from './lib/storage';
import ItemCard from './components/ItemCard';
import SearchBar from './components/SearchBar';
import ItemFilters from './components/ItemFilters';
import PendingAgreements from './components/PendingAgreements';
import { useAuth } from './components/AuthProvider';
import ViewToggle from './components/ViewToggle';
import AgendaView from './components/AgendaView';
import BalanceView from './components/BalanceView';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'borrowed' | 'lent'>('all');
  const [returnedFilter, setReturnedFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [currentView, setCurrentView] = useState<'grid' | 'agenda' | 'balance'>('grid');
  const { user, signOut } = useAuth();

  const loadItems = async () => {
    console.log('Loading items...');
    setLoading(true);
    try {
      const fetchedItems = await getAllItems();
      console.log('Fetched items:', fetchedItems.length);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const pendingItems = items.filter(
    item => item.agreement_status === 'pending' && item.borrower_id === user?.id
  );

  const activeItems = items.filter(item => {
    // Filter by type (all/borrowed/lent)
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    
    // Filter by returned status
    if (returnedFilter === 'active' && item.returned) {
      return false;
    }
    if (returnedFilter === 'returned' && !item.returned) {
      return false;
    }
    
    return true;
  });

  const filteredItems = activeItems.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Items</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user ? `Logged in as: ${user.email}` : 'Not logged in'}
          </p>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Sign Out
              </button>
              <Link
                href="/api/calendar"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Export Calendar
              </Link>
              <Link
                href="/add"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Item
              </Link>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {user && (
        <PendingAgreements 
          items={pendingItems} 
          onUpdate={loadItems} 
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <ItemFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            returnedFilter={returnedFilter}
            onReturnedFilterChange={setReturnedFilter}
          />
        </div>
        <ViewToggle
          currentView={currentView}
          onViewChange={setCurrentView}
        />
      </div>

      {currentView === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item}
              onUpdate={loadItems}
            />
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
              No items found
            </div>
          )}
        </div>
      )}

      {currentView === 'agenda' && (
        <AgendaView 
          items={filteredItems}
          onMarkAsReturned={async (itemId, currentStatus) => {
            try {
              await updateItem(itemId, { returned: !currentStatus });
              loadItems();
            } catch (error) {
              console.error('Failed to update item:', error);
            }
          }}
        />
      )}

      {currentView === 'balance' && (
        <BalanceView items={filteredItems} />
      )}
    </div>
  );
} 