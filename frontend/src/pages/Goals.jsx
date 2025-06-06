import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getFinancialGoals, getTransactions } from '../config/api';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
    const [view, setView] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('progress'); // 'progress', 'deadline', 'amount'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed'

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        setIsLoading(true);
        try {
            const goalsData = await getFinancialGoals();
            setGoals(goalsData);
        } catch (error) {
            toast.error('Failed to load goals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoalSubmit = async (formData) => {
        try {
            if (editingGoal) {
                // Update existing goal
                const updatedGoal = { 
                    ...editingGoal, 
                    ...formData,
                    reminderFrequency: formData.reminderFrequency || 'never',
                    category: formData.category || 'General'
                };
                setGoals(prevGoals => 
                    prevGoals.map(g => g.id === editingGoal.id ? updatedGoal : g)
                );
                toast.success('Goal updated successfully');
            } else {
                // Add new goal
                const newGoal = {
                    id: Date.now().toString(),
                    ...formData,
                    current: 0,
                    createdAt: new Date().toISOString(),
                    reminderFrequency: formData.reminderFrequency || 'never',
                    category: formData.category || 'General',
                    contributions: []
                };
                setGoals(prevGoals => [...prevGoals, newGoal]);
                toast.success('Goal added successfully');
            }
            setIsFormVisible(false);
            setEditingGoal(null);
        } catch (error) {
            toast.error('Failed to save goal');
        }
    };

    const handleDeleteGoal = async (id) => {
        try {
            setGoals(prevGoals => prevGoals.filter(g => g.id !== id));
            toast.success('Goal deleted successfully');
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const handleContribution = async (goalId, amount, note) => {
        try {
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;

            const newContribution = {
                id: Date.now().toString(),
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                note: note
            };

            const updatedGoal = {
                ...goal,
                current: goal.current + parseFloat(amount),
                contributions: [...(goal.contributions || []), newContribution]
            };

            setGoals(prevGoals => 
                prevGoals.map(g => g.id === goalId ? updatedGoal : g)
            );

            setIsContributionModalOpen(false);
            toast.success('Contribution added successfully');
        } catch (error) {
            toast.error('Failed to add contribution');
        }
    };

    const getGoalStatus = (goal) => {
        const progress = (goal.current / goal.target) * 100;
        const deadline = new Date(goal.deadline);
        const today = new Date();
        const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

        if (progress >= 100) return 'completed';
        if (daysLeft < 0) return 'overdue';
        if (daysLeft <= 30) return 'urgent';
        return 'active';
    };

    const sortGoals = (goals) => {
        return [...goals].sort((a, b) => {
            switch (sortBy) {
                case 'progress':
                    return (b.current / b.target) - (a.current / a.target);
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'amount':
                    return b.target - a.target;
                default:
                    return 0;
            }
        });
    };

    const filterGoals = (goals) => {
        return goals.filter(goal => {
            const status = getGoalStatus(goal);
            if (filterStatus === 'all') return true;
            if (filterStatus === 'completed') return status === 'completed';
            if (filterStatus === 'active') return status !== 'completed';
            return true;
        });
    };

    const displayGoals = sortGoals(filterGoals(goals));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-400">Loading goals...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
                <div className="grid gap-8">
                    {/* Header and Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">Financial Goals</h1>
                            <p className="text-gray-400 mt-1">Track and manage your savings targets</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {/* View Toggle */}
                            <div className="flex bg-gray-800 rounded-lg p-1">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        view === 'grid' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setView('list')}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        view === 'list' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    List
                                </button>
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-1 text-sm border border-gray-700"
                            >
                                <option value="progress">Sort by Progress</option>
                                <option value="deadline">Sort by Deadline</option>
                                <option value="amount">Sort by Amount</option>
                            </select>

                            {/* Filter Dropdown */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-gray-800 text-white rounded-lg px-3 py-1 text-sm border border-gray-700"
                            >
                                <option value="all">All Goals</option>
                                <option value="active">Active Goals</option>
                                <option value="completed">Completed Goals</option>
                            </select>

                            <button
                                onClick={() => {
                                    setIsFormVisible(true);
                                    setEditingGoal(null);
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors text-sm font-medium"
                            >
                                Add Goal
                            </button>
                        </div>
                    </div>

                    {/* Goals Display */}
                    {displayGoals.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
                            <div className="text-gray-400 text-lg">No financial goals found</div>
                            <p className="text-gray-500 text-sm mt-2">
                                {filterStatus !== 'all' 
                                    ? 'Try changing your filter settings'
                                    : 'Start by adding your first financial goal'}
                            </p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${
                            view === 'grid' 
                                ? 'md:grid-cols-2 lg:grid-cols-3' 
                                : 'grid-cols-1'
                        }`}>
                            {displayGoals.map(goal => {
                                const status = getGoalStatus(goal);
                                const progress = (goal.current / goal.target) * 100;
                                const statusColors = {
                                    completed: 'bg-green-500',
                                    overdue: 'bg-red-500',
                                    urgent: 'bg-yellow-500',
                                    active: 'bg-blue-500'
                                };

                                return (
                                    <div 
                                        key={goal.id}
                                        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 ${
                                            view === 'list' ? 'flex justify-between items-center' : ''
                                        }`}
                                    >
                                        <div className={view === 'list' ? 'flex-1' : ''}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-semibold text-white">
                                                            {goal.name}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                            status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                                            status === 'overdue' ? 'bg-red-500/20 text-red-300' :
                                                            status === 'urgent' ? 'bg-yellow-500/20 text-yellow-300' :
                                                            'bg-blue-500/20 text-blue-300'
                                                        }`}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 mt-1">
                                                        {goal.description}
                                                    </p>
                                                </div>
                                                {view === 'grid' && (
                                                    <div className="text-right">
                                                        <div className="text-lg font-medium text-blue-400">
                                                            {new Intl.NumberFormat('en-IN', {
                                                                style: 'currency',
                                                                currency: 'INR',
                                                                maximumFractionDigits: 0
                                                            }).format(goal.current)} / {new Intl.NumberFormat('en-IN', {
                                                                style: 'currency',
                                                                currency: 'INR',
                                                                maximumFractionDigits: 0
                                                            }).format(goal.target)}
                                                        </div>
                                                        <div className="text-sm text-gray-400 mt-1">
                                                            Due by {new Date(goal.deadline).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{Math.round(progress)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-500 ${statusColors[status]}`}
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedGoal(goal);
                                                        setIsContributionModalOpen(true);
                                                    }}
                                                    className="text-sm text-green-400 hover:text-green-300 transition-colors"
                                                >
                                                    Add Progress
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingGoal(goal);
                                                        setIsFormVisible(true);
                                                    }}
                                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Goal Form Modal */}
            <Modal
                isOpen={isFormVisible}
                onClose={() => {
                    setIsFormVisible(false);
                    setEditingGoal(null);
                }}
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                    </h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = {
                            name: e.target.name.value,
                            description: e.target.description.value,
                            target: parseFloat(e.target.target.value),
                            deadline: e.target.deadline.value,
                            category: e.target.category.value,
                            reminderFrequency: e.target.reminderFrequency.value
                        };
                        handleGoalSubmit(formData);
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={editingGoal?.name}
                                    required
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={editingGoal?.description}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Target Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    name="target"
                                    defaultValue={editingGoal?.target}
                                    required
                                    min="0"
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    defaultValue={editingGoal?.category || 'General'}
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                >
                                    <option value="General">General</option>
                                    <option value="Emergency Fund">Emergency Fund</option>
                                    <option value="Retirement">Retirement</option>
                                    <option value="Education">Education</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Home">Home</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    defaultValue={editingGoal?.deadline}
                                    required
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Reminder Frequency
                                </label>
                                <select
                                    name="reminderFrequency"
                                    defaultValue={editingGoal?.reminderFrequency || 'never'}
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                >
                                    <option value="never">Never</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFormVisible(false);
                                    setEditingGoal(null);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                                {editingGoal ? 'Update Goal' : 'Create Goal'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Contribution Modal */}
            <Modal
                isOpen={isContributionModalOpen}
                onClose={() => setIsContributionModalOpen(false)}
            >
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Add Progress</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleContribution(
                            selectedGoal?.id,
                            e.target.amount.value,
                            e.target.note.value
                        );
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">
                                    Note (Optional)
                                </label>
                                <textarea
                                    name="note"
                                    rows={2}
                                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                    placeholder="Add a note about this contribution..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsContributionModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                            >
                                Add Progress
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default Goals; 