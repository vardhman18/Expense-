const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const GOALS_FILE = path.join(DATA_DIR, 'goals.json');
const BILLS_FILE = path.join(DATA_DIR, 'bills.json');

// Ensure data directory exists
const initStorage = async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize files if they don't exist
        const files = [TRANSACTIONS_FILE, CATEGORIES_FILE, GOALS_FILE, BILLS_FILE];
        for (const file of files) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, JSON.stringify([]));
            }
        }
    } catch (error) {
        console.error('Failed to initialize storage:', error);
        throw error;
    }
};

// Generic read function
const readData = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
};

// Generic write function
const writeData = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to write to ${filePath}:`, error);
        throw error;
    }
};

// Transaction specific functions
const getTransactions = async () => readData(TRANSACTIONS_FILE);
const saveTransactions = async (transactions) => writeData(TRANSACTIONS_FILE, transactions);

// Category specific functions
const getCategories = async () => readData(CATEGORIES_FILE);
const saveCategories = async (categories) => writeData(CATEGORIES_FILE, categories);

// Goals specific functions
const getGoals = async () => readData(GOALS_FILE);
const saveGoals = async (goals) => writeData(GOALS_FILE, goals);

// Bills specific functions
const getBills = async () => readData(BILLS_FILE);
const saveBills = async (bills) => writeData(BILLS_FILE, bills);

module.exports = {
    initStorage,
    getTransactions,
    saveTransactions,
    getCategories,
    saveCategories,
    getGoals,
    saveGoals,
    getBills,
    saveBills
}; 