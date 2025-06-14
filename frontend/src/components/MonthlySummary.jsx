import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '../config/api';

const MonthlySummary = ({ transactions }) => {
  const monthlySummaries = useMemo(() => {
    const summaries = {};
    
    transactions.forEach(transaction => {
      const monthYear = format(new Date(transaction.date), 'yyyy-MM');
      if (!summaries[monthYear]) {
        summaries[monthYear] = {
          income: 0,
          expense: 0,
          net: 0,
          month: format(new Date(transaction.date), 'MMMM yyyy')
        };
      }
      
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        summaries[monthYear].income += amount;
        summaries[monthYear].net += amount;
      } else {
        summaries[monthYear].expense += amount;
        summaries[monthYear].net -= amount;
      }
    });

    return Object.values(summaries).sort((a, b) => 
      new Date(b.month) - new Date(a.month)
    );
  }, [transactions]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Monthly Summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {monthlySummaries.map((summary) => (
          <div key={summary.month} className="p-4 rounded-lg bg-gray-800 shadow-md">
            <h3 className="text-lg font-medium mb-2">{summary.month}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-400">Income:</span>
                <span>{formatCurrency(summary.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">Expense:</span>
                <span>{formatCurrency(summary.expense)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-gray-700 pt-2 mt-2">
                <span>Net:</span>
                <span className={summary.net >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatCurrency(summary.net)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlySummary; 