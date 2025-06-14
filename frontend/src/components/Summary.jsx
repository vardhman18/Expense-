import React from 'react';
import { formatCurrency } from '../config/api';

const Summary = ({ transactions = [] }) => {
    const calculateTotals = () => {
        return transactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                acc.totalIncome += amount;
            } else {
                acc.totalExpenses += amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });
    };

    const { totalIncome, totalExpenses } = calculateTotals();
    const balance = totalIncome - totalExpenses;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-gray-400 text-sm">Monthly Income</h3>
                <p className="text-2xl font-bold text-green-400 mt-2">
                    {formatCurrency(totalIncome)}
                </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-gray-400 text-sm">Monthly Expenses</h3>
                <p className="text-2xl font-bold text-red-400 mt-2">
                    {formatCurrency(totalExpenses)}
                </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-gray-400 text-sm">Net Savings</h3>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-red-400'} mt-2`}>
                    {formatCurrency(balance)}
                </p>
            </div>
        </div>
    );
};

export default Summary; 