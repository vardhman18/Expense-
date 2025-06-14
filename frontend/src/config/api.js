import { toast } from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';
const JWT_STORAGE_KEY = 'budgetbuddy_token';
const USER_STORAGE_KEY = 'budgetbuddy_user';

// Currency formatting helper
const USD_CONVERSION_RATE = 83; // 1 USD = 83 INR

export const formatCurrencyINR = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.abs(amount));
    return formattedAmount;
};

export const formatCurrencyUSD = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.abs(amount));
    return formattedAmount;
};

export const convertINRtoUSD = (amountInINR) => {
    return amountInINR / USD_CONVERSION_RATE;
};

// Unified currency display helper
export const formatCurrency = (amount) => {
    return `${formatCurrencyINR(amount)} / ${formatCurrencyUSD(convertINRtoUSD(amount))}`;
};

const API_ENDPOINTS = {
    login: '/auth/login',
    logout: '/auth/logout',
    transactions: '/transactions',
    categories: '/categories',
    recurring: '/recurring',
    goals: '/goals',
    budgets: '/budgets',
    export: '/export',
    import: '/import',
    savingsGoals: '/savings-goals',
    billReminders: '/bill-reminders',
    analytics: {
        overview: '/analytics/overview',
        trends: '/analytics/trends'
    },
    expenseSplits: '/expense-splits'
};

// Helper function to get the stored token
export const getToken = () => localStorage.getItem(JWT_STORAGE_KEY);

// Helper function to get the stored user data
export const getUser = () => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
};

// Validate transaction data
const validateTransaction = (transaction) => {
    if (!transaction) throw new Error('Transaction data is required');
    if (!transaction.type) throw new Error('Transaction type is required');
    if (!transaction.amount) throw new Error('Transaction amount is required');
    if (!transaction.date) throw new Error('Transaction date is required');
    
    // Ensure amount is a valid number
    const amount = parseFloat(transaction.amount);
    if (isNaN(amount)) throw new Error('Invalid transaction amount');
    
    // Validate transaction type
    if (!['income', 'expense'].includes(transaction.type)) {
        throw new Error('Invalid transaction type');
    }
    
    return {
        ...transaction,
        amount: amount
    };
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem(JWT_STORAGE_KEY);
                localStorage.removeItem(USER_STORAGE_KEY);
                window.location.href = '/login';
                throw new Error('Session expired. Please login again.');
            }
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Authentication functions
export const login = async (credentials) => {
    try {
        const data = await apiCall(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        localStorage.setItem(JWT_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await apiCall(API_ENDPOINTS.logout, { method: 'POST' });
    } finally {
        localStorage.removeItem(JWT_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
    }
};

// Transaction functions
export const getTransactions = async () => {
    const data = await apiCall(API_ENDPOINTS.transactions);
    const transactions = data.transactions || [];
    
    // Validate and clean transactions data
    return transactions.map(t => {
        try {
            return validateTransaction(t);
        } catch (error) {
            console.warn('Invalid transaction data:', t, error);
            return null;
        }
    }).filter(Boolean); // Remove invalid transactions
};

export const addTransaction = async (transaction) => {
    const validatedTransaction = validateTransaction(transaction);
    const data = await apiCall(API_ENDPOINTS.transactions, {
        method: 'POST',
        body: JSON.stringify(validatedTransaction)
    });
    return data.transaction;
};

export const updateTransaction = async (id, transaction) => {
    const validatedTransaction = validateTransaction(transaction);
    const data = await apiCall(`${API_ENDPOINTS.transactions}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(validatedTransaction)
    });
    return data.transaction;
};

export const deleteTransaction = async (id) => {
    await apiCall(`${API_ENDPOINTS.transactions}/${id}`, {
        method: 'DELETE'
    });
};

// Category functions
export const getCategories = async () => {
    const data = await apiCall(API_ENDPOINTS.categories);
    return data.categories || [];
};

// Recurring transactions functions
export const getRecurringTransactions = async () => {
    const data = await apiCall(API_ENDPOINTS.recurring);
    return data.recurring || [];
};

// Financial goals functions
export const getFinancialGoals = async () => {
    const data = await apiCall(API_ENDPOINTS.goals);
    return data.goals || [];
};

// Budget functions
export const getBudgets = async () => {
    const data = await apiCall(API_ENDPOINTS.budgets);
    return data.budgets || [];
};

export const updateBudget = async (category, amount) => {
    const data = await apiCall(API_ENDPOINTS.budgets, {
        method: 'PUT',
        body: JSON.stringify({ category, amount })
    });
    return data.budget;
};

// Data import/export functions
export const exportData = async () => {
    const data = await apiCall(API_ENDPOINTS.export);
    return data.exportData;
};

export const importData = async (data) => {
    const response = await apiCall(API_ENDPOINTS.import, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response.success;
};

// Savings Goals functions
export const getSavingsGoals = async () => {
    const data = await apiCall(API_ENDPOINTS.savingsGoals);
    return data.savingsGoals || [];
};

export const addSavingsGoal = async (goalData) => {
    const data = await apiCall(API_ENDPOINTS.savingsGoals, {
        method: 'POST',
        body: JSON.stringify(goalData)
    });
    return data;
};

export const contributeSavingsGoal = async (goalId, amount) => {
    const data = await apiCall(`${API_ENDPOINTS.savingsGoals}/${goalId}/contribute`, {
        method: 'PUT',
        body: JSON.stringify({ amount })
    });
    return data;
};

// Bill Reminders functions
export const getBillReminders = async () => {
    const data = await apiCall(API_ENDPOINTS.billReminders);
    return data.billReminders || [];
};

export const addBillReminder = async (reminderData) => {
    const data = await apiCall(API_ENDPOINTS.billReminders, {
        method: 'POST',
        body: JSON.stringify(reminderData)
    });
    return data;
};

export const updateBillReminder = async (id, updates) => {
    const data = await apiCall(`${API_ENDPOINTS.billReminders}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    return data;
};

export const deleteBillReminder = async (id) => {
    await apiCall(`${API_ENDPOINTS.billReminders}/${id}`, {
        method: 'DELETE'
    });
};

// Analytics functions
export const getBudgetAnalytics = async () => {
    const data = await apiCall(API_ENDPOINTS.analytics.overview);
    return data;
};

export const getBudgetTrends = async () => {
    const data = await apiCall(API_ENDPOINTS.analytics.trends);
    return data;
};

// Expense Splitting functions
export const getExpenseSplits = async () => {
    const data = await apiCall(API_ENDPOINTS.expenseSplits);
    return data.expenseSplits || [];
};

export const createExpenseSplit = async (splitData) => {
    const data = await apiCall(API_ENDPOINTS.expenseSplits, {
        method: 'POST',
        body: JSON.stringify(splitData)
    });
    return data;
};

export const settleExpenseSplit = async (splitId, participantName) => {
    const data = await apiCall(`${API_ENDPOINTS.expenseSplits}/${splitId}/settle`, {
        method: 'PUT',
        body: JSON.stringify({ participantName })
    });
    return data;
}; 