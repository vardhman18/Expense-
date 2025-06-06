export const categories = {
    expense: [
        { id: 'food', label: 'Food & Dining', icon: '🍽️' },
        { id: 'transport', label: 'Transportation', icon: '🚗' },
        { id: 'utilities', label: 'Utilities', icon: '💡' },
        { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
        { id: 'shopping', label: 'Shopping', icon: '🛍️' },
        { id: 'health', label: 'Healthcare', icon: '🏥' },
        { id: 'education', label: 'Education', icon: '📚' },
        { id: 'housing', label: 'Housing & Rent', icon: '🏠' },
        { id: 'insurance', label: 'Insurance', icon: '🛡️' },
        { id: 'personal', label: 'Personal Care', icon: '💆' },
        { id: 'gifts', label: 'Gifts & Donations', icon: '🎁' },
        { id: 'bills', label: 'Bills', icon: '📄' },
        { id: 'other_expense', label: 'Other Expenses', icon: '📋' }
    ],
    income: [
        { id: 'salary', label: 'Salary', icon: '💰' },
        { id: 'business', label: 'Business', icon: '💼' },
        { id: 'investment', label: 'Investments', icon: '📈' },
        { id: 'rental', label: 'Rental Income', icon: '🏘️' },
        { id: 'freelance', label: 'Freelance', icon: '💻' },
        { id: 'pension', label: 'Pension', icon: '👴' },
        { id: 'interest', label: 'Interest', icon: '🏦' },
        { id: 'dividends', label: 'Dividends', icon: '💵' },
        { id: 'gifts_received', label: 'Gifts Received', icon: '🎀' },
        { id: 'other_income', label: 'Other Income', icon: '📋' }
    ]
};

export const getCategoryById = (type, id) => {
    const list = categories[type] || [];
    return list.find(cat => cat.id === id) || { id: 'unknown', label: 'Unknown', icon: '❓' };
};

export const getCategoryIcon = (type, id) => {
    return getCategoryById(type, id).icon;
};

export const getCategoryLabel = (type, id) => {
    return getCategoryById(type, id).label;
}; 