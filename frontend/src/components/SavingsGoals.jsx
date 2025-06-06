import React from 'react';
import { formatCurrency } from '../config/api';

const SavingsGoals = ({ goals = [] }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Savings Goals</h2>
            <div className="space-y-4">
                {goals.map((goal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const remaining = goal.targetAmount - goal.currentAmount;

                    return (
                        <div 
                            key={goal.id}
                            className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-white font-medium">{goal.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                                    </p>
                                </div>
                                <span className="text-sm font-medium text-blue-400">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            
                            <div className="relative pt-1">
                                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-600/50">
                                    <div
                                        style={{ width: `${progress}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mt-2">
                                {remaining > 0 
                                    ? `${formatCurrency(remaining)} remaining`
                                    : 'Goal achieved! 🎉'}
                            </p>
                        </div>
                    );
                })}
                {goals.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No savings goals set</p>
                )}
            </div>
        </div>
    );
};

export default SavingsGoals; 