import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import SpendingSummary from './SpendingSummary';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Chart = ({ type = 'line', data, options = {} }) => {
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: type === 'doughnut' ? 'right' : 'bottom',
                labels: {
                    color: '#9ca3af',
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const formattedValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 2
                        }).format(value);
                        return `${context.dataset ? context.dataset.label + ': ' : ''}${formattedValue}`;
                    }
                }
            }
        },
        scales: type === 'line' ? {
            x: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)'
                },
                ticks: {
                    color: '#9ca3af'
                }
            },
            y: {
                grid: {
                    color: 'rgba(75, 85, 99, 0.2)'
                },
                ticks: {
                    color: '#9ca3af',
                    callback: (value) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                        }).format(value);
                    }
                }
            }
        } : undefined
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        plugins: {
            ...defaultOptions.plugins,
            ...options.plugins
        }
    };

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <p className="text-lg">No data available</p>
                <p className="text-sm mt-2">Add some data to see the chart</p>
            </div>
        );
    }

    const ChartComponent = type === 'line' ? Line : Doughnut;
    return <ChartComponent data={data} options={mergedOptions} />;
};

export default Chart; 