import React from 'react';
import { format } from 'date-fns';

const RecentActivity = ({ transactions = [] }) => {
    const formatCurrency = (amount) => {
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
        return `₹${formattedAmount}`;
    };

    const sortedTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {sortedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                                transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                            }`} />
                            <div>
                                <p className="text-white font-medium">{transaction.description}</p>
                                <p className="text-sm text-gray-400">
                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        <p className={`font-medium ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {transaction.type === 'income' ? '+' : '-'} 
                            {formatCurrency(transaction.amount)}
                        </p>
                    </div>
                ))}
                {sortedTransactions.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No recent transactions</p>
                )}
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-gray-700/50 hover:bg-gray-700/75 text-gray-300 rounded-lg transition-colors">
                View All Transactions
            </button>
        </div>
    );
};

export default RecentActivity; 