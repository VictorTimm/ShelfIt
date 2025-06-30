'use client';

import { Item } from '../lib/types';
import Link from 'next/link';

interface AgendaViewProps {
  items: Item[];
  onMarkAsReturned: (itemId: string, currentStatus: boolean) => void;
}

export default function AgendaView({ items, onMarkAsReturned }: AgendaViewProps) {
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

  // Group items by month and year
  const groupedItems = items.reduce((groups, item) => {
    const date = new Date(item.date);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(item);
    return groups;
  }, {} as Record<string, Item[]>);

  // Sort items within each group by date
  Object.values(groupedItems).forEach(monthItems => {
    monthItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Get sorted month-year keys
  const sortedMonthYears = Object.keys(groupedItems).sort((a, b) => {
    const dateA = new Date(groupedItems[a][0].date);
    const dateB = new Date(groupedItems[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-8">
      {sortedMonthYears.map((monthYear) => (
        <div key={monthYear} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {monthYear}
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {groupedItems[monthYear].map((item) => {
              const date = new Date(item.date);
              const reminderDate = item.reminder_date ? new Date(item.reminder_date) : null;
              const isNearReminder = reminderDate && 
                (new Date().getTime() - reminderDate.getTime()) / (1000 * 60 * 60 * 24) > -2;

              return (
                <div 
                  key={item.id}
                  className={`px-6 py-4 ${isNearReminder ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-16 text-sm text-gray-500 dark:text-gray-400">
                        {date.toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.item_name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.returned
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          }`}>
                            {item.returned ? 'Returned' : 'Active'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.type === 'borrowed' ? 'Borrowed from' : 'Lent to'} {item.person}
                          </span>
                          {reminderDate && (
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              · Reminder: {reminderDate.toLocaleDateString()}
                            </span>
                          )}
                          {isNearReminder && !item.returned && (
                            <span className="ml-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                              Due in less than 2 days!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => onMarkAsReturned(item.id, item.returned)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        {item.returned ? 'Mark as Active' : 'Mark as Returned'}
                      </button>
                      <Link
                        href={`/edit/${item.id}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {sortedMonthYears.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No items found
        </div>
      )}
    </div>
  );
} 