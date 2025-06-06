import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import { getBudgetAnalytics, getBudgetTrends } from '../config/api';
import Chart from '../components/Chart';

const Analytics = () => {
    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const [overviewData, trendsData] = await Promise.all([
                getBudgetAnalytics(),
                getBudgetTrends()
            ]);
            setOverview(overviewData);
            setTrends(trendsData.trends);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Budget Analytics</h1>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-gray-400 mb-2">Total Income</h3>
                        <p className="text-2xl font-bold text-green-400">
                            ${overview?.totalIncome.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-gray-400 mb-2">Total Expenses</h3>
                        <p className="text-2xl font-bold text-red-400">
                            ${overview?.totalExpenses.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h3 className="text-gray-400 mb-2">Net Savings</h3>
                        <p className={`text-2xl font-bold ${overview?.netSavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            ${overview?.netSavings.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            Savings Rate: {overview?.savingsRate.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Spending Trends Chart */}
                <div className="bg-gray-800 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6">6-Month Spending Trends</h2>
                    <div className="h-80">
                        <Chart
                            type="line"
                            data={{
                                labels: trends?.map(t => t.month) || [],
                                datasets: [
                                    {
                                        label: 'Income',
                                        data: trends?.map(t => t.income) || [],
                                        borderColor: '#34D399',
                                        tension: 0.4
                                    },
                                    {
                                        label: 'Expenses',
                                        data: trends?.map(t => t.expenses) || [],
                                        borderColor: '#F87171',
                                        tension: 0.4
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)'
                                        },
                                        ticks: {
                                            color: '#9CA3AF'
                                        }
                                    },
                                    x: {
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)'
                                        },
                                        ticks: {
                                            color: '#9CA3AF'
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: '#9CA3AF'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Category Spending */}
                <div className="bg-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-6">Category Spending</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-80">
                            <Chart
                                type="doughnut"
                                data={{
                                    labels: Object.keys(overview?.categorySpending || {}),
                                    datasets: [{
                                        data: Object.values(overview?.categorySpending || {}),
                                        backgroundColor: [
                                            '#3B82F6',
                                            '#10B981',
                                            '#F59E0B',
                                            '#EF4444',
                                            '#8B5CF6',
                                            '#EC4899',
                                            '#6366F1'
                                        ]
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                color: '#9CA3AF'
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-4">
                            {Object.entries(overview?.categorySpending || {}).map(([category, amount]) => (
                                <div key={category} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-lg">
                                    <span className="text-gray-300">{category}</span>
                                    <span className="font-medium">${amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics; 