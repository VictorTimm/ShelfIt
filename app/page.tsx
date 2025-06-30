'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Item } from './lib/types';
import { supabase } from './lib/supabase';
import ItemCard from './components/ItemCard';
import ViewToggle from './components/ViewToggle';
import AgendaView from './components/AgendaView';
import BalanceView from './components/BalanceView';
import SearchBar from './components/SearchBar';
import ItemFilters from './components/ItemFilters';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [view, setView] = useState<'grid' | 'agenda' | 'balance'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchItems();
    
    const channel = supabase
      .channel('items_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchItems = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      return;
    }

    setItems(data || []);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.person.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || item.type === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'Active' && !item.returned) ||
                         (selectedStatus === 'Returned' && item.returned);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const handleMarkAsReturned = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('items')
      .update({ returned: !currentStatus })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
      return;
    }

    setItems(items.map(item => 
      item.id === itemId ? { ...item, returned: !currentStatus } : item
    ));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Items</h1>
        <Link
          href="/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Item
        </Link>
      </div>

      <div className="space-y-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <ItemFilters
            selectedType={selectedType}
            selectedStatus={selectedStatus}
            selectedCategory={selectedCategory}
            onTypeChange={setSelectedType}
            onStatusChange={setSelectedStatus}
            onCategoryChange={setSelectedCategory}
          />
          <ViewToggle currentView={view} onViewChange={setView} />
        </div>

        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onMarkAsReturned={handleMarkAsReturned}
              />
            ))}
          </div>
        )}

        {view === 'agenda' && (
          <AgendaView items={filteredItems} onMarkAsReturned={handleMarkAsReturned} />
        )}

        {view === 'balance' && (
          <BalanceView items={filteredItems} />
        )}

        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No items found. Try adjusting your filters or add a new item.
          </p>
        )}
      </div>
    </main>
  );
} 