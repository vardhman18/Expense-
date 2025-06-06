import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '../config/api';

const BillReminders = ({ bills = [] }) => {
    const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Upcoming Bills</h2>
            <div className="space-y-4">
                {sortedBills.map((bill) => (
                    <div 
                        key={bill.id}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                    >
                        <div>
                            <p className="text-white font-medium">{bill.description}</p>
                            <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-400">Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    bill.status === 'paid' 
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {bill.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                            </div>
                        </div>
                        <p className="font-medium text-white">
                            {formatCurrency(bill.amount)}
                        </p>
                    </div>
                ))}
                {sortedBills.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No upcoming bills</p>
                )}
            </div>
        </div>
    );
};

export default BillReminders; 