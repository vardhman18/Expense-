import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getSavingsGoals, addSavingsGoal, contributeSavingsGoal } from '../config/api';

const SavingsGoals = () => {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isContributeModalVisible, setIsContributeModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        description: ''
    });
    const [contributionAmount, setContributionAmount] = useState('');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await getSavingsGoals();
            setGoals(data);
        } catch (error) {
            toast.error('Failed to load savings goals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newGoal = await addSavingsGoal({
                ...formData,
                targetAmount: parseFloat(formData.targetAmount)
            });
            setGoals(prev => [...prev, newGoal]);
            setIsFormVisible(false);
            setFormData({ name: '', targetAmount: '', deadline: '', description: '' });
            toast.success('Savings goal created successfully');
        } catch (error) {
            toast.error('Failed to create savings goal');
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        try {
            const updatedGoal = await contributeSavingsGoal(
                selectedGoal.id,
                parseFloat(contributionAmount)
            );
            setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
            setIsContributeModalVisible(false);
            setContributionAmount('');
            setSelectedGoal(null);
            toast.success('Contribution added successfully');
        } catch (error) {
            toast.error('Failed to add contribution');
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
                    <h1 className="text-3xl font-bold">Savings Goals</h1>
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                        Add New Goal
                    </button>
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <div key={goal.id} className="bg-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold">{goal.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-sm ${
                                    goal.progress >= 100 
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {goal.progress >= 100 ? 'Completed' : 'In Progress'}
                                </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full h-3 bg-gray-700 rounded-full mb-4">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                />
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Amount</span>
                                    <span className="font-medium">${goal.currentAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Target Amount</span>
                                    <span className="font-medium">${goal.targetAmount.toFixed(2)}</span>
                                </div>
                                {goal.deadline && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Deadline</span>
                                        <span className="font-medium">
                                            {new Date(goal.deadline).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedGoal(goal);
                                    setIsContributeModalVisible(true);
                                }}
                                className="w-full px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                disabled={goal.progress >= 100}
                            >
                                Add Contribution
                            </button>
                        </div>
                    ))}
                </div>

                {/* New Goal Form Modal */}
                <Modal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)}>
                    <h2 className="text-2xl font-bold mb-6">Create New Savings Goal</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Goal Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Target Amount ($)</label>
                            <input
                                type="number"
                                value={formData.targetAmount}
                                onChange={e => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Deadline (Optional)</label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            Create Goal
                        </button>
                    </form>
                </Modal>

                {/* Contribute Modal */}
                <Modal
                    isOpen={isContributeModalVisible}
                    onClose={() => {
                        setIsContributeModalVisible(false);
                        setSelectedGoal(null);
                        setContributionAmount('');
                    }}
                >
                    <h2 className="text-2xl font-bold mb-6">Add Contribution</h2>
                    <form onSubmit={handleContribute} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Amount ($)</label>
                            <input
                                type="number"
                                value={contributionAmount}
                                onChange={e => setContributionAmount(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            Add Contribution
                        </button>
                    </form>
                </Modal>
            </main>
        </div>
    );
};

export default SavingsGoals; 