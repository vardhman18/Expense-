const express = require('express');
const router = express.Router();
const {
    getAllTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    exportTransactions
} = require('../controllers/transactionController');

// Transaction routes
router.get('/', getAllTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

// Import/Export routes
router.post('/import', importTransactions);
router.get('/export', exportTransactions);

module.exports = router; 