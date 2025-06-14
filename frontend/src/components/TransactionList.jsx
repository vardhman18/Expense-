import React from 'react';
import { format } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import { categories } from '../utils/categories';
import { formatCurrency } from '../config/api';

const TransactionList = ({ 
    transactions = [], 
    onEdit, 
    onDelete,
    sortConfig = { field: 'date', order: 'desc' },
    onSort,
    currentPage = 1,
    itemsPerPage = 10,
    onPageChange
}) => {
    const formatAmount = (amount, type) => {
        const formatted = formatCurrency(amount);
        return type === 'expense' ? `- ${formatted}` : formatted;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        return status === 'cleared'
            ? `${baseClasses} bg-green-400/10 text-green-400`
            : `${baseClasses} bg-yellow-400/10 text-yellow-400`;
    };

    const getCategoryIcon = (categoryId, type) => {
        const category = categories[type]?.find(c => c.id === categoryId);
        return category ? `${category.icon} ${category.label}` : categoryId;
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = transactions
        .filter(transaction => transaction && typeof transaction === 'object')
        .slice(startIndex, endIndex);
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const handleSort = (field) => {
        if (onSort) {
            const newOrder = sortConfig.field === field && sortConfig.order === 'asc' ? 'desc' : 'asc';
            onSort(field, newOrder);
        }
    };

    const getSortIcon = (field) => {
        if (sortConfig.field !== field) return '↕️';
        return sortConfig.order === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden sm:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th 
                                    onClick={() => handleSort('date')}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                                >
                                    Date {getSortIcon('date')}
                                </th>
                                <th 
                                    onClick={() => handleSort('description')}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                                >
                                    Description {getSortIcon('description')}
                                </th>
                                <th 
                                    onClick={() => handleSort('category')}
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                                >
                                    Category {getSortIcon('category')}
                                </th>
                                <th 
                                    onClick={() => handleSort('amount')}
                                    className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                                >
                                    Amount {getSortIcon('amount')}
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {paginatedTransactions.map((transaction) => (
                                <tr 
                                    key={transaction.id} 
                                    className="group hover:bg-gray-700/30 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                                        {formatDate(transaction.date)}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-col">
                                            <span>{transaction.description}</span>
                                            {transaction.notes && (
                                                <span className="text-xs text-gray-400 mt-1">
                                                    {transaction.notes}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {getCategoryIcon(transaction.category, transaction.type)}
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right whitespace-nowrap ${
                                        transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={getStatusBadge(transaction.status)}>
                                            {transaction.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(transaction)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(transaction.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden">
                <div className="space-y-4">
                    {paginatedTransactions.map((transaction) => (
                        <div 
                            key={transaction.id} 
                            className="bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-700/50"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="font-medium">{transaction.description}</div>
                                    <div className="text-sm text-gray-400">
                                        {formatDate(transaction.date)}
                                    </div>
                                </div>
                                <div className={`text-sm font-medium ${
                                    transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                    {formatAmount(transaction.amount, transaction.type)}
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div className="text-gray-400">
                                    {getCategoryIcon(transaction.category, transaction.type)}
                                </div>
                                <span className={getStatusBadge(transaction.status)}>
                                    {transaction.status}
                                </span>
                            </div>

                            {transaction.notes && (
                                <div className="text-sm text-gray-400 border-t border-gray-700/50 pt-2">
                                    {transaction.notes}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-700/50">
                                <button
                                    onClick={() => onEdit(transaction)}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(transaction.id)}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {transactions.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-400 text-lg">No transactions found</div>
                    <p className="text-gray-500 text-sm mt-2">
                        Add your first transaction to get started
                    </p>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-700/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TransactionList; 