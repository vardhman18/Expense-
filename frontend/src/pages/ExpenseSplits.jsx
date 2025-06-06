import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getExpenseSplits, createExpenseSplit, settleExpenseSplit } from '../config/api';

const ExpenseSplits = () => {
    const [splits, setSplits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        totalAmount: '',
        participants: [''],
        splitType: 'equal',
        shares: {}
    });

    useEffect(() => {
        loadSplits();
    }, []);

    const loadSplits = async () => {
        try {
            const data = await getExpenseSplits();
            setSplits(data);
        } catch (error) {
            toast.error('Failed to load expense splits');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddParticipant = () => {
        setFormData(prev => ({
            ...prev,
            participants: [...prev.participants, '']
        }));
    };

    const handleRemoveParticipant = (index) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    const handleParticipantChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            participants: prev.participants.map((p, i) => i === index ? value : p)
        }));
    };

    const handleShareChange = (participant, amount) => {
        setFormData(prev => ({
            ...prev,
            shares: {
                ...prev.shares,
                [participant]: parseFloat(amount) || 0
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Filter out empty participants
            const validParticipants = formData.participants.filter(p => p.trim());
            
            if (validParticipants.length < 2) {
                toast.error('At least 2 participants are required');
                return;
            }

            // For custom split, validate total shares equals total amount
            if (formData.splitType === 'custom') {
                const totalShares = Object.values(formData.shares).reduce((sum, amount) => sum + amount, 0);
                if (Math.abs(totalShares - parseFloat(formData.totalAmount)) > 0.01) {
                    toast.error('Sum of shares must equal total amount');
                    return;
                }
            }

            const newSplit = await createExpenseSplit({
                ...formData,
                participants: validParticipants,
                totalAmount: parseFloat(formData.totalAmount)
            });

            setSplits(prev => [...prev, newSplit]);
            setIsFormVisible(false);
            setFormData({
                description: '',
                totalAmount: '',
                participants: [''],
                splitType: 'equal',
                shares: {}
            });
            toast.success('Expense split created successfully');
        } catch (error) {
            toast.error('Failed to create expense split');
        }
    };

    const handleSettle = async (splitId, participantName) => {
        try {
            const updatedSplit = await settleExpenseSplit(splitId, participantName);
            setSplits(prev => prev.map(s => s.id === updatedSplit.id ? updatedSplit : s));
            toast.success(`Marked as settled for ${participantName}`);
        } catch (error) {
            toast.error('Failed to update settlement status');
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Split Expenses</h1>
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                        New Split Expense
                    </button>
                </div>

                {/* Splits List */}
                <div className="space-y-6">
                    {splits.map(split => (
                        <div key={split.id} className="bg-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{split.description}</h3>
                                    <p className="text-gray-400">
                                        Total Amount: ${split.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    split.status === 'settled'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {split.status === 'settled' ? 'Settled' : 'Pending'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {split.participants.map(participant => {
                                    const isSettled = split.settledParticipants.includes(participant);
                                    const shareAmount = split.shares[participant];

                                    return (
                                        <div
                                            key={participant}
                                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                                        >
                                            <div>
                                                <span className="font-medium">{participant}</span>
                                                <span className="text-gray-400 ml-4">
                                                    ${shareAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleSettle(split.id, participant)}
                                                disabled={isSettled}
                                                className={`px-3 py-1 rounded-lg transition-colors ${
                                                    isSettled
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                                }`}
                                            >
                                                {isSettled ? 'Settled' : 'Mark as Settled'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* New Split Form Modal */}
                <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)}>
                    <h2 className="text-2xl font-bold mb-6">Create New Split Expense</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Total Amount ($)</label>
                            <input
                                type="number"
                                value={formData.totalAmount}
                                onChange={e => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Split Type</label>
                            <select
                                value={formData.splitType}
                                onChange={e => setFormData(prev => ({ ...prev, splitType: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="equal">Equal Split</option>
                                <option value="custom">Custom Split</option>
                            </select>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-gray-400">Participants</label>
                            {formData.participants.map((participant, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={participant}
                                        onChange={e => handleParticipantChange(index, e.target.value)}
                                        placeholder="Participant name"
                                        className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    {formData.splitType === 'custom' && participant && (
                                        <input
                                            type="number"
                                            value={formData.shares[participant] || ''}
                                            onChange={e => handleShareChange(participant, e.target.value)}
                                            placeholder="Share amount"
                                            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={formData.splitType === 'custom'}
                                            min="0"
                                            step="0.01"
                                        />
                                    )}
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveParticipant(index)}
                                            className="p-2 text-red-400 hover:text-red-300"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddParticipant}
                                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Add Participant
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            Create Split Expense
                        </button>
                    </form>
                </Modal>
            </main>
        </div>
    );
};

export default ExpenseSplits; 