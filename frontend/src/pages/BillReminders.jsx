import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { getBillReminders, addBillReminder, updateBillReminder, deleteBillReminder } from '../config/api';

const BillReminders = () => {
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        recurring: 'none',
        notes: ''
    });

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const data = await getBillReminders();
            setReminders(data);
        } catch (error) {
            toast.error('Failed to load bill reminders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingReminder) {
                const updatedReminder = await updateBillReminder(editingReminder.id, formData);
                setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
                toast.success('Reminder updated successfully');
            } else {
                const newReminder = await addBillReminder(formData);
                setReminders(prev => [...prev, newReminder]);
                toast.success('Reminder created successfully');
            }
            setIsFormVisible(false);
            setEditingReminder(null);
            setFormData({
                name: '',
                amount: '',
                dueDate: '',
                category: '',
                recurring: 'none',
                notes: ''
            });
        } catch (error) {
            toast.error(editingReminder ? 'Failed to update reminder' : 'Failed to create reminder');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reminder?')) return;
        
        try {
            await deleteBillReminder(id);
            setReminders(prev => prev.filter(r => r.id !== id));
            toast.success('Reminder deleted successfully');
        } catch (error) {
            toast.error('Failed to delete reminder');
        }
    };

    const handleStatusToggle = async (reminder) => {
        try {
            const updatedReminder = await updateBillReminder(reminder.id, {
                ...reminder,
                status: reminder.status === 'pending' ? 'paid' : 'pending'
            });
            setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
            toast.success('Reminder status updated');
        } catch (error) {
            toast.error('Failed to update reminder status');
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
                    <h1 className="text-3xl font-bold">Bill Reminders</h1>
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                        Add New Reminder
                    </button>
                </div>

                {/* Reminders List */}
                <div className="space-y-4">
                    {reminders.map(reminder => (
                        <div
                            key={reminder.id}
                            className="bg-gray-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex-grow space-y-2">
                                <div className="flex items-start justify-between">
                                    <h3 className="text-xl font-semibold">{reminder.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        reminder.status === 'paid'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                        {reminder.status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <span className="text-gray-400 block text-sm">Amount</span>
                                        <span className="font-medium">${reminder.amount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-sm">Due Date</span>
                                        <span className="font-medium">
                                            {new Date(reminder.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-sm">Category</span>
                                        <span className="font-medium">{reminder.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-sm">Recurring</span>
                                        <span className="font-medium capitalize">{reminder.recurring}</span>
                                    </div>
                                </div>
                                {reminder.notes && (
                                    <p className="text-gray-400 text-sm mt-2">{reminder.notes}</p>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-2">
                                <button
                                    onClick={() => handleStatusToggle(reminder)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        reminder.status === 'paid'
                                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    }`}
                                >
                                    {reminder.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingReminder(reminder);
                                        setFormData(reminder);
                                        setIsFormVisible(true);
                                    }}
                                    className="px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(reminder.id)}
                                    className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add/Edit Reminder Modal */}
                <Modal
                    isOpen={isFormVisible}
                    onClose={() => {
                        setIsFormVisible(false);
                        setEditingReminder(null);
                        setFormData({
                            name: '',
                            amount: '',
                            dueDate: '',
                            category: '',
                            recurring: 'none',
                            notes: ''
                        });
                    }}
                >
                    <h2 className="text-2xl font-bold mb-6">
                        {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Bill Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Amount ($)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Recurring</label>
                            <select
                                value={formData.recurring}
                                onChange={e => setFormData(prev => ({ ...prev, recurring: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="none">None</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Notes (Optional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                        >
                            {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                        </button>
                    </form>
                </Modal>
            </main>
        </div>
    );
};

export default BillReminders; 