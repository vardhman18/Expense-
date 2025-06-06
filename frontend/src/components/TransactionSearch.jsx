import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

function TransactionSearch({ transactions, onFilteredTransactions }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('description');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchType, minAmount, maxAmount, dateRange, transactions]);

  const handleSearch = () => {
    try {
      let filtered = [...transactions];

      // Text search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(t => {
          switch (searchType) {
            case 'description':
              return t.description.toLowerCase().includes(term);
            case 'category':
              return t.category.toLowerCase().includes(term);
            case 'all':
              return (
                t.description.toLowerCase().includes(term) ||
                t.category.toLowerCase().includes(term) ||
                t.notes?.toLowerCase().includes(term)
              );
            default:
              return true;
          }
        });
      }

      // Amount range
      if (minAmount) {
        filtered = filtered.filter(t => t.amount >= parseFloat(minAmount));
      }
      if (maxAmount) {
        filtered = filtered.filter(t => t.amount <= parseFloat(maxAmount));
      }

      // Date range
      if (dateRange.start) {
        filtered = filtered.filter(t => new Date(t.date) >= new Date(dateRange.start));
      }
      if (dateRange.end) {
        filtered = filtered.filter(t => new Date(t.date) <= new Date(dateRange.end));
      }

      onFilteredTransactions(filtered);
    } catch (error) {
      toast.error('Error filtering transactions');
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchType('description');
    setMinAmount('');
    setMaxAmount('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Text Search */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="bg-gray-600 text-white px-3 py-2 rounded-md"
            >
              <option value="description">Description</option>
              <option value="category">Category</option>
              <option value="all">All Fields</option>
            </select>
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min Amount"
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md"
            />
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max Amount"
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Search Stats */}
      <div className="text-sm text-gray-400">
        Found {transactions.length} transactions
      </div>
    </div>
  );
}

export default TransactionSearch; 