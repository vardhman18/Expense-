import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SpendingChart = ({ transactions = [] }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const formatCurrency = (amount) => {
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(amount));
        return `₹${formattedAmount}`;
    };

    const prepareChartData = () => {
        const categoryTotals = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, transaction) => {
                const category = transaction.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + parseFloat(transaction.amount);
                return acc;
            }, {});

        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        return {
            labels: sortedCategories.map(([category]) => category),
            data: sortedCategories.map(([, amount]) => amount)
        };
    };

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const { labels, data } = prepareChartData();

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        '#60A5FA', // blue-400
                        '#34D399', // green-400
                        '#F87171', // red-400
                        '#FBBF24', // yellow-400
                        '#A78BFA', // purple-400
                        '#EC4899', // pink-400
                        '#2DD4BF', // teal-400
                        '#FB923C', // orange-400
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9CA3AF', // gray-400
                            padding: 10,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [transactions]);

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold text-white mb-4">Spending by Category</h2>
            <div className="h-[300px]">
                <canvas ref={chartRef} />
            </div>
        </div>
    );
};

export default SpendingChart; 