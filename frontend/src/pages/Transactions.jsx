import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, getCategories } from '../config/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [filters, setFilters] = useState({
        type: 'all',
        category: 'all',
        period: 'all'
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'date',
        order: 'desc'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [transactionsData, categoriesData] = await Promise.all([
                getTransactions(),
                getCategories()
            ]);

            // Validate and clean transaction data
            const validTransactions = (transactionsData || [])
                .filter(transaction => 
                    transaction && 
                    typeof transaction === 'object' &&
                    transaction.id &&
                    transaction.date &&
                    transaction.amount !== undefined
                )
                .map(transaction => ({
                    ...transaction,
                    date: transaction.date || new Date().toISOString(),
                    amount: parseFloat(transaction.amount) || 0,
                    type: transaction.type || 'expense',
                    status: transaction.status || 'pending'
                }));

            setTransactions(validTransactions);
            setFilteredTransactions(validTransactions);
            setCategories(categoriesData || []);
        } catch (error) {
            toast.error('Failed to load data');
            setTransactions([]);
            setFilteredTransactions([]);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransactionSubmit = async (formData) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, formData);
                toast.success('Transaction updated successfully');
            } else {
                await addTransaction(formData);
                toast.success('Transaction added successfully');
            }
            await loadData(); // Always reload from backend
            setIsFormVisible(false);
            setEditingTransaction(null);
        } catch (error) {
            toast.error(error.message || 'Failed to save transaction');
        }
    };

    const handleDeleteTransaction = async (id) => {
        try {
            await deleteTransaction(id);
            setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
            setFilteredTransactions(prevFiltered => prevFiltered.filter(t => t.id !== id));
            toast.success('Transaction deleted successfully');
        } catch (error) {
            toast.error('Failed to delete transaction');
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSort = (field) => {
        setSortConfig(prevConfig => ({
            field,
            order: prevConfig.field === field && prevConfig.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Apply filters and sorting
    const applyFilters = () => {
        let filtered = [...transactions];

        // Apply category filter
        if (filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }

        // Apply type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === filters.type);
        }

        // Apply period filter
        if (filters.period !== 'all') {
            const today = new Date();
            const startDate = new Date();

            switch (filters.period) {
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(today.getFullYear() - 1);
                    break;
                default:
                    break;
            }

            filtered = filtered.filter(t => new Date(t.date) >= startDate);
        }

        // Apply sorting
        if (sortConfig.field) {
            filtered.sort((a, b) => {
                if (a[sortConfig.field] < b[sortConfig.field]) return sortConfig.order === 'asc' ? -1 : 1;
                if (a[sortConfig.field] > b[sortConfig.field]) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredTransactions(filtered);
    };

    // Apply filters whenever filters or sort config changes
    useEffect(() => {
        applyFilters();
    }, [filters, sortConfig, transactions]);

    // Add a refresh function
    const refreshTransactions = async () => {
        try {
            const transactionsData = await getTransactions();
            const validTransactions = (transactionsData || [])
                .filter(transaction => 
                    transaction && 
                    typeof transaction === 'object' &&
                    transaction.id &&
                    transaction.date &&
                    transaction.amount !== undefined
                )
                .map(transaction => ({
                    ...transaction,
                    date: transaction.date || new Date().toISOString(),
                    amount: parseFloat(transaction.amount) || 0,
                    type: transaction.type || 'expense',
                    status: transaction.status || 'pending'
                }));

            setTransactions(validTransactions);
            setFilteredTransactions(validTransactions);
        } catch (error) {
            toast.error('Failed to refresh transactions');
        }
    };

    // Add useEffect to refresh data periodically
    useEffect(() => {
        const refreshInterval = setInterval(refreshTransactions, 30000); // Refresh every 30 seconds
        return () => clearInterval(refreshInterval);
    }, []);

    if (isLoading) {
  return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Loading transactions...</p>
        </div>
      </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-8">
                    {/* Filters and Actions */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4">
                            {/* Type Filter */}
                      <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange({ ...filters, type: e.target.value })}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                        <option value="expense">Expense</option>
                            </select>

                            {/* Category Filter */}
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            {/* Period Filter */}
                            <select
                                value={filters.period}
                                onChange={(e) => handleFilterChange({ ...filters, period: e.target.value })}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="year">Last Year</option>
                      </select>
                    </div>

                      <button
                            onClick={() => {
                                setIsFormVisible(true);
                                setEditingTransaction(null);
                            }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                            Add Transaction
                      </button>
                    </div>

                    {/* Transaction List */}
                    <TransactionList
                        transactions={filteredTransactions}
                        onEdit={transaction => {
                            setEditingTransaction(transaction);
                            setIsFormVisible(true);
                        }}
                        onDelete={handleDeleteTransaction}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </div>
            </main>

            {/* Transaction Form Modal */}
            <Modal
                isOpen={isFormVisible}
                onClose={() => {
                    setIsFormVisible(false);
                    setEditingTransaction(null);
                }}
                title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            >
                <TransactionForm
                    onTransactionAdded={handleTransactionSubmit}
                    onClose={() => {
                        setIsFormVisible(false);
                        setEditingTransaction(null);
                    }}
                    initialData={editingTransaction}
                />
            </Modal>
        </div>
    );
};

export default Transactions; 