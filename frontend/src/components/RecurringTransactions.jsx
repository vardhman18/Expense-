import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getRecurringTransactions, formatCurrency } from '../config/api';

const RecurringTransactions = ({ recurring = [], onUpdate }) => {
    if (!recurring.length) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400 text-lg">No recurring transactions</div>
                <p className="text-gray-500 text-sm mt-2">
                    Add recurring transactions to automate your budget
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">Recurring Transactions</h3>
            <div className="grid gap-4">
                {recurring.map((transaction) => (
                    <div 
                        key={transaction.id}
                        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-gray-200">
                                    {transaction.description}
                                </h4>
                                <p className="text-sm text-gray-400 mt-1">
                                    Every {transaction.frequency}
                                </p>
                            </div>
                            <div className={`text-sm font-medium ${
                                transaction.type === 'expense' 
                                    ? 'text-red-400' 
                                    : 'text-green-400'
                            }`}>
                                {formatCurrency(transaction.amount)}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => onUpdate(transaction)}
                                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onUpdate(null, transaction.id)}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecurringTransactions; 