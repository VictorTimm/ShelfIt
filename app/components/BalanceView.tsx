'use client';

import { Item } from '../lib/types';

interface BalanceViewProps {
  items: Item[];
}

export default function BalanceView({ items }: BalanceViewProps) {
  // Filter only money items and calculate totals
  const moneyItems = items.filter(item => item.category === 'Money' && !item.returned);
  
  const borrowed = moneyItems
    .filter(item => item.type === 'borrowed')
    .reduce((total, item) => total + (parseFloat(item.item_name) || 0), 0);
  
  const lent = moneyItems
    .filter(item => item.type === 'lent')
    .reduce((total, item) => total + (parseFloat(item.item_name) || 0), 0);
  
  const balance = lent - borrowed;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Borrowed Money Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Money You Borrowed
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(borrowed)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total amount you need to pay back
          </p>
        </div>

        {/* Lent Money Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
            Money You Lent
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(lent)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total amount others need to pay you back
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Net Balance
          </h3>
          <p className={`text-3xl font-bold ${
            balance > 0 
              ? 'text-green-600 dark:text-green-400'
              : balance < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {balance > 0 
              ? 'You are owed money'
              : balance < 0
                ? 'You owe money'
                : 'All settled up!'}
          </p>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Active Money Transactions</h3>
        <div className="space-y-4">
          {moneyItems.length > 0 ? (
            moneyItems.map(item => (
              <div 
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {item.type === 'borrowed' ? 'Borrowed from' : 'Lent to'} {item.person}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <p className={`text-lg font-semibold ${
                  item.type === 'borrowed'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {formatCurrency(parseFloat(item.item_name) || 0)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No active money transactions
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 