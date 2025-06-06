import React, { useState } from 'react';
import { exportData, importData } from '../config/api';
import { toast } from 'react-hot-toast';

const BackupRestore = ({ onExport }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const data = await exportData();
            
            // Create a download link
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `budgetbuddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Full backup created successfully');
            if (onExport) onExport(data);
        } catch (error) {
            toast.error('Failed to create backup');
            console.error('Backup error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const result = e.target?.result;
                    if (typeof result === 'string') {
                        const data = JSON.parse(result);
                        await importData(data);
                        toast.success('Backup restored successfully');
                        if (onExport) onExport();
                    }
                } catch (error) {
                    toast.error('Failed to restore backup');
                    console.error('Restore error:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            toast.error('Failed to read backup file');
            console.error('File read error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-200">Backup & Restore</h3>
            <div className="flex gap-4">
                <button
                    onClick={handleExport}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isLoading
                            ? 'bg-blue-500/50 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isLoading ? 'Creating Backup...' : 'Create Backup'}
                </button>
                <label className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isLoading
                        ? 'bg-purple-500/50 cursor-not-allowed'
                        : 'bg-purple-500 hover:bg-purple-600'
                }`}>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={isLoading}
                        className="hidden"
                    />
                    {isLoading ? 'Restoring...' : 'Restore Backup'}
                </label>
            </div>
            <p className="text-sm text-gray-400">
                Create a backup of all your BudgetBuddy data (transactions, goals, categories, and settings) or restore from a previous backup.
            </p>
        </div>
    );
};

export default BackupRestore; 