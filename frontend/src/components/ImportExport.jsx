import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';

const ImportExport = ({ onImport, transactions }) => {
  const fileInputRef = useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid file format. Expected an array of transactions.');
      }

      // Validate each transaction
      const isValid = data.every(transaction => {
        return (
          transaction.description &&
          transaction.amount &&
          transaction.date &&
          transaction.type &&
          transaction.category
        );
      });

      if (!isValid) {
        throw new Error('Invalid transaction data. Please check the file format.');
      }

      await onImport(data);
      toast.success('Transactions imported successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to import transactions');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-buddy-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Transactions exported successfully!');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200 mb-3">Transaction Import/Export</h3>
      <div className="flex gap-4 items-center">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Import
          </label>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export
        </button>
      </div>
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <p className="text-sm text-gray-300 mb-2">
          <span className="font-medium text-blue-400">Import:</span> Upload a JSON file containing your transactions from another source or a previous export.
        </p>
        <p className="text-sm text-gray-300">
          <span className="font-medium text-gray-400">Export:</span> Download your current transactions as a JSON file for backup or transfer to another system.
        </p>
        <p className="text-xs text-gray-400 mt-2 italic">
          Supported format: JSON file containing an array of transactions with description, amount, date, type, and category fields.
        </p>
      </div>
    </div>
  );
};

export default ImportExport; 