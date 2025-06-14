const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const transactionRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Ensure data files exist
const files = {
    transactions: path.join(dataDir, 'transactions.json'),
    categories: path.join(dataDir, 'categories.json'),
    recurring: path.join(dataDir, 'recurring.json'),
    goals: path.join(dataDir, 'goals.json'),
    savingsGoals: path.join(dataDir, 'savingsGoals.json'),
    billReminders: path.join(dataDir, 'billReminders.json'),
    expenseSplits: path.join(dataDir, 'expenseSplits.json')
};

// Initialize data files if they don't exist
Object.entries(files).forEach(([key, file]) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([]));
    }
});

// Helper functions
const readData = (file) => {
    const data = fs.readFileSync(file);
    return JSON.parse(data);
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Categories Routes
app.get('/api/categories', (req, res) => {
    try {
        const categories = readData(files.categories);
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Error reading categories' });
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const categories = readData(files.categories);
        const newCategory = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        categories.push(newCategory);
        writeData(files.categories, categories);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error adding category' });
    }
});

// Recurring Transactions Routes
app.get('/api/recurring', (req, res) => {
    try {
        const recurring = readData(files.recurring);
        res.json({ recurring });
    } catch (error) {
        res.status(500).json({ message: 'Error reading recurring transactions' });
    }
});

app.post('/api/recurring', (req, res) => {
    try {
        const recurring = readData(files.recurring);
        const newRecurring = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        recurring.push(newRecurring);
        writeData(files.recurring, recurring);
        res.status(201).json(newRecurring);
    } catch (error) {
        res.status(500).json({ message: 'Error adding recurring transaction' });
    }
});

// Financial Goals Routes
app.get('/api/goals', (req, res) => {
    try {
        const goals = readData(files.goals);
        res.json({ goals });
    } catch (error) {
        res.status(500).json({ message: 'Error reading goals' });
    }
});

app.post('/api/goals', (req, res) => {
    try {
        const goals = readData(files.goals);
        const newGoal = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        goals.push(newGoal);
        writeData(files.goals, goals);
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ message: 'Error adding goal' });
    }
});

// Savings Goals Routes
app.get('/api/savings-goals', (req, res) => {
    try {
        const savingsGoals = readData(files.savingsGoals);
        res.json({ savingsGoals });
    } catch (error) {
        res.status(500).json({ message: 'Error reading savings goals' });
    }
});

app.post('/api/savings-goals', (req, res) => {
    try {
        const savingsGoals = readData(files.savingsGoals);
        const newGoal = {
            id: uuidv4(),
            ...req.body,
            currentAmount: 0,
            progress: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        savingsGoals.push(newGoal);
        writeData(files.savingsGoals, savingsGoals);
        res.status(201).json(newGoal);
    } catch (error) {
        res.status(500).json({ message: 'Error adding savings goal' });
    }
});

app.put('/api/savings-goals/:id/contribute', (req, res) => {
    try {
        const { amount } = req.body;
        const savingsGoals = readData(files.savingsGoals);
        const goalIndex = savingsGoals.findIndex(g => g.id === req.params.id);
        
        if (goalIndex === -1) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }

        const goal = savingsGoals[goalIndex];
        goal.currentAmount += parseFloat(amount);
        goal.progress = (goal.currentAmount / goal.targetAmount) * 100;
        goal.lastUpdated = new Date().toISOString();

        writeData(files.savingsGoals, savingsGoals);
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating savings goal' });
    }
});

// Transactions Routes
app.get('/api/transactions', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ message: 'Error reading transactions' });
    }
});

app.post('/api/transactions', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        const newTransaction = {
            id: uuidv4(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        transactions.push(newTransaction);
        writeData(files.transactions, transactions);
        res.status(201).json({ transaction: newTransaction });
    } catch (error) {
        res.status(500).json({ message: 'Error adding transaction' });
    }
});

app.put('/api/transactions/:id', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        const index = transactions.findIndex(t => t.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        transactions[index] = { ...transactions[index], ...req.body };
        writeData(files.transactions, transactions);
        res.json(transactions[index]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction' });
    }
});

app.delete('/api/transactions/:id', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        const filteredTransactions = transactions.filter(t => t.id !== req.params.id);
        writeData(files.transactions, filteredTransactions);
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction' });
    }
});

// Import/Export Routes
app.post('/api/import', (req, res) => {
    try {
        const importedTransactions = req.body;
        if (!Array.isArray(importedTransactions)) {
            return res.status(400).json({ message: 'Invalid import data' });
        }
        const transactions = readData(files.transactions);
        const newTransactions = importedTransactions.map(t => ({
            ...t,
            id: uuidv4(),
            createdAt: new Date().toISOString()
        }));
        writeData(files.transactions, [...transactions, ...newTransactions]);
        res.json({ message: 'Transactions imported successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error importing transactions' });
    }
});

app.get('/api/export', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error exporting transactions' });
    }
});

// Bill Reminders Routes
app.get('/api/bill-reminders', (req, res) => {
    try {
        const billReminders = readData(files.billReminders);
        res.json({ billReminders });
    } catch (error) {
        res.status(500).json({ message: 'Error reading bill reminders' });
    }
});

app.post('/api/bill-reminders', (req, res) => {
    try {
        const billReminders = readData(files.billReminders);
        const newReminder = {
            id: uuidv4(),
            ...req.body,
            status: 'pending',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        billReminders.push(newReminder);
        writeData(files.billReminders, billReminders);
        res.status(201).json(newReminder);
    } catch (error) {
        res.status(500).json({ message: 'Error adding bill reminder' });
    }
});

app.put('/api/bill-reminders/:id', (req, res) => {
    try {
        const billReminders = readData(files.billReminders);
        const index = billReminders.findIndex(b => b.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ message: 'Bill reminder not found' });
        }

        billReminders[index] = {
            ...billReminders[index],
            ...req.body,
            lastUpdated: new Date().toISOString()
        };

        writeData(files.billReminders, billReminders);
        res.json(billReminders[index]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bill reminder' });
    }
});

app.delete('/api/bill-reminders/:id', (req, res) => {
    try {
        const billReminders = readData(files.billReminders);
        const filteredReminders = billReminders.filter(b => b.id !== req.params.id);
        writeData(files.billReminders, filteredReminders);
        res.json({ message: 'Bill reminder deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting bill reminder' });
    }
});

// Expense Sharing Routes
app.get('/api/expense-splits', (req, res) => {
    try {
        const expenseSplits = readData(files.expenseSplits);
        res.json({ expenseSplits });
    } catch (error) {
        res.status(500).json({ message: 'Error reading expense splits' });
    }
});

app.post('/api/expense-splits', (req, res) => {
    try {
        const expenseSplits = readData(files.expenseSplits);
        const { totalAmount, description, participants, splitType = 'equal' } = req.body;

        // Calculate shares based on split type
        let shares = {};
        if (splitType === 'equal') {
            const perPersonAmount = parseFloat(totalAmount) / participants.length;
            participants.forEach(p => {
                shares[p] = perPersonAmount;
            });
        } else if (splitType === 'custom') {
            shares = req.body.shares;
        }

        const newSplit = {
            id: uuidv4(),
            totalAmount: parseFloat(totalAmount),
            description,
            participants,
            splitType,
            shares,
            settledParticipants: [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        expenseSplits.push(newSplit);
        writeData(files.expenseSplits, expenseSplits);
        res.status(201).json(newSplit);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense split' });
    }
});

app.put('/api/expense-splits/:id/settle', (req, res) => {
    try {
        const { participantName } = req.body;
        const expenseSplits = readData(files.expenseSplits);
        const splitIndex = expenseSplits.findIndex(s => s.id === req.params.id);

        if (splitIndex === -1) {
            return res.status(404).json({ message: 'Expense split not found' });
        }

        const split = expenseSplits[splitIndex];
        
        if (!split.settledParticipants.includes(participantName)) {
            split.settledParticipants.push(participantName);
        }

        // Update status if all participants have settled
        if (split.settledParticipants.length === split.participants.length) {
            split.status = 'settled';
        }

        split.lastUpdated = new Date().toISOString();
        writeData(files.expenseSplits, expenseSplits);
        res.json(split);
    } catch (error) {
        res.status(500).json({ message: 'Error settling expense split' });
    }
});

// Budget Analytics Routes
app.get('/api/analytics/overview', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filter transactions for current month
        const monthlyTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        });

        // Calculate totals
        const totalIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Calculate category-wise spending
        const categorySpending = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
                return acc;
            }, {});

        res.json({
            totalIncome,
            totalExpenses,
            netSavings: totalIncome - totalExpenses,
            categorySpending,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating analytics' });
    }
});

app.get('/api/analytics/trends', (req, res) => {
    try {
        const transactions = readData(files.transactions);
        const last6Months = [];
        const currentDate = new Date();

        // Generate last 6 months data
        for (let i = 0; i < 6; i++) {
            const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthTransactions = transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate.getMonth() === targetDate.getMonth() &&
                       transDate.getFullYear() === targetDate.getFullYear();
            });

            const monthData = {
                month: targetDate.toLocaleString('default', { month: 'short' }),
                income: monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0),
                expenses: monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            };

            last6Months.unshift(monthData);
        }

        res.json({ trends: last6Months });
    } catch (error) {
        res.status(500).json({ message: 'Error generating trends' });
    }
});

// Add logout route if not present
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
module.exports = app; 