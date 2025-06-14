const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getTransactions, saveTransactions } = require('../utils/storage');
const { validateAmount, parseRupees, formatToRupees, formatToUSD, convertINRtoUSD } = require('../utils/currency');

const dataDir = path.join(__dirname, '..', 'data');
const transactionsFile = path.join(dataDir, 'transactions.json');

// Ensure data directory and file exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
if (!fs.existsSync(transactionsFile)) {
    fs.writeFileSync(transactionsFile, JSON.stringify([]));
}

// Helper functions
const readTransactions = () => {
    try {
        const data = fs.readFileSync(transactionsFile);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading transactions:', error);
        return [];
    }
};

const writeTransactions = (transactions) => {
    try {
        fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    } catch (error) {
        console.error('Error writing transactions:', error);
        throw new Error('Failed to save transactions');
    }
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

// Controllers
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await getTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ message: 'Error reading transactions' });
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const validatedTransaction = validateTransaction(req.body);
        const transactions = await getTransactions();
        
        const newTransaction = {
            id: uuidv4(),
            ...validatedTransaction,
            createdAt: new Date().toISOString()
        };
        
        transactions.push(newTransaction);
        await saveTransactions(transactions);
        
        res.status(201).json({ transaction: newTransaction });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(400).json({ message: error.message || 'Error adding transaction' });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const validatedTransaction = validateTransaction(req.body);
        const transactions = await getTransactions();
        
        const index = transactions.findIndex(t => t.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        transactions[index] = {
            ...transactions[index],
            ...validatedTransaction,
            updatedAt: new Date().toISOString()
        };
        
        await saveTransactions(transactions);
        res.json(transactions[index]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(400).json({ message: error.message || 'Error updating transaction' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transactions = await getTransactions();
        
        const filteredTransactions = transactions.filter(t => t.id !== id);
        if (filteredTransactions.length === transactions.length) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        await saveTransactions(filteredTransactions);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Error deleting transaction' });
    }
};

exports.importTransactions = async (req, res) => {
    try {
        const importedTransactions = req.body;
        if (!Array.isArray(importedTransactions)) {
            return res.status(400).json({ message: 'Invalid import data' });
        }
        
        const transactions = await getTransactions();
        const newTransactions = importedTransactions.map(t => ({
            ...validateTransaction(t),
            id: uuidv4(),
            createdAt: new Date().toISOString()
        }));
        
        await saveTransactions([...transactions, ...newTransactions]);
        res.json({ message: 'Transactions imported successfully' });
    } catch (error) {
        console.error('Error importing transactions:', error);
        res.status(400).json({ message: error.message || 'Error importing transactions' });
    }
};

exports.exportTransactions = async (req, res) => {
    try {
        const transactions = await getTransactions();
        res.json({ transactions });
    } catch (error) {
        console.error('Error exporting transactions:', error);
        res.status(500).json({ message: 'Error exporting transactions' });
    }
};

exports.getMonthlySummary = async (req, res) => {
    try {
        const transactions = await getTransactions();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        const monthlyTransactions = transactions.filter(t => 
            t.date.startsWith(currentMonth)
        );

        const summary = monthlyTransactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            if (transaction.type === 'income') {
                acc.totalIncome += amount;
            } else {
                acc.totalExpenses += amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });

        summary.netSavings = summary.totalIncome - summary.totalExpenses;
        summary.savingsRate = summary.totalIncome > 0 
            ? (summary.netSavings / summary.totalIncome) * 100 
            : 0;

        // Format amounts in rupees and dollars
        summary.formattedTotalIncome = formatToRupees(summary.totalIncome);
        summary.formattedTotalExpenses = formatToRupees(summary.totalExpenses);
        summary.formattedNetSavings = formatToRupees(summary.netSavings);

        // Add USD values
        summary.totalIncomeUSD = convertINRtoUSD(summary.totalIncome);
        summary.totalExpensesUSD = convertINRtoUSD(summary.totalExpenses);
        summary.netSavingsUSD = convertINRtoUSD(summary.netSavings);
        summary.formattedTotalIncomeUSD = formatToUSD(summary.totalIncomeUSD);
        summary.formattedTotalExpensesUSD = formatToUSD(summary.totalExpensesUSD);
        summary.formattedNetSavingsUSD = formatToUSD(summary.netSavingsUSD);

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get monthly summary' });
    }
}; 