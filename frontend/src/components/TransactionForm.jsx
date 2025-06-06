import React, { useState } from 'react';
import { addTransaction } from '../config/api';
import { toast } from 'react-hot-toast';
import { categories } from '../utils/categories';

const TransactionForm = ({ onTransactionAdded, onClose }) => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: categories.expense[0].id,
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const transactionData = {
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString()
            };
            
            const response = await addTransaction(transactionData);
            
            if (response) {
                toast.success('Transaction added successfully');
                setFormData({
                    description: '',
                    amount: '',
                    type: 'expense',
                    category: categories.expense[0].id,
                    date: new Date().toISOString().split('T')[0]
                });
                
                if (onTransactionAdded) {
                    onTransactionAdded(response);
                }
                
                if (onClose) {
                    onClose();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add transaction');
            console.error('Failed to add transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount') {
            // Only allow numbers and decimal point
            const sanitizedValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            if (sanitizedValue.split('.').length > 2) return;
            // Ensure only 2 decimal places
            const parts = sanitizedValue.split('.');
            if (parts[1] && parts[1].length > 2) return;
            setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
        } else if (name === 'type') {
            // When type changes, reset category to first of new type
            setFormData(prev => ({
                ...prev,
                type: value,
                category: categories[value][0].id
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const currentCategories = categories[formData.type] || [];

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-800/50 rounded-lg">
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            formData.type === 'expense'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        <span className="text-lg">💸</span> Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            formData.type === 'income'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        <span className="text-lg">💰</span> Income
                    </button>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-800/50 border ${
                            errors.description ? 'border-red-500' : 'border-gray-700'
                        } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                        placeholder="Enter description"
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (₹)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            className={`w-full pl-8 pr-4 py-3 bg-gray-800/50 border ${
                                errors.amount ? 'border-red-500' : 'border-gray-700'
                            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                            placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    </div>
                    {errors.amount && (
                        <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                    </label>
                    <div className="relative">
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            {currentCategories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.icon} {category.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                        isSubmitting
                            ? 'bg-blue-500/50 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm; 