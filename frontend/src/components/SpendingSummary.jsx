import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingSummary = ({ transactions = [] }) => {
    const chartData = useMemo(() => {
        // Filter expenses and group by category
        const categoryTotals = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        // Sort categories by amount (descending)
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a);

        // Take top 5 categories, combine rest into "Others"
        const topCategories = sortedCategories.slice(0, 5);
        const otherCategories = sortedCategories.slice(5);
        const otherTotal = otherCategories.reduce((sum, [, amount]) => sum + amount, 0);

        // Prepare chart data
        const labels = [
            ...topCategories.map(([category]) => category),
            ...(otherTotal > 0 ? ['Others'] : [])
        ];
        const data = [
            ...topCategories.map(([, amount]) => amount),
            ...(otherTotal > 0 ? [otherTotal] : [])
        ];

        // Generate colors
        const colors = [
            'rgb(59, 130, 246)', // blue
            'rgb(16, 185, 129)', // green
            'rgb(245, 158, 11)', // yellow
            'rgb(236, 72, 153)', // pink
            'rgb(139, 92, 246)', // purple
            'rgb(107, 114, 128)', // gray (for Others)
        ];

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: 'rgb(17, 24, 39)',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
    }, [transactions]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af',
                    padding: 20,
                    font: {
                        size: 12
                    },
                    generateLabels: (chart) => {
                        const { data } = chart;
                        const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
                        
                        return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const percentage = ((value / total) * 100).toFixed(1);
                            const formattedValue = new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0
                            }).format(value);
                            
                            return {
                                text: `${label} (${percentage}%) - ${formattedValue}`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            };
                        });
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        const formattedValue = new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                        }).format(value);
                        return `${context.label}: ${formattedValue} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (!transactions.length) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400 text-lg">No spending data</div>
                <p className="text-gray-500 text-sm mt-2">
                    Add some transactions to see your spending breakdown
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">Spending by Category</h3>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="h-[300px]">
                    <Doughnut data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default SpendingSummary; 