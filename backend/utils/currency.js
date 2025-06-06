// Currency formatting utility functions
const formatToRupees = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.abs(amount));
    return `₹${formattedAmount}`;
};

const parseRupees = (amountString) => {
    // Remove the ₹ symbol and any commas, then parse as float
    const cleanAmount = amountString.replace(/[₹,]/g, '');
    return parseFloat(cleanAmount);
};

const validateAmount = (amount) => {
    const numAmount = typeof amount === 'string' ? parseRupees(amount) : amount;
    if (isNaN(numAmount) || numAmount < 0) {
        throw new Error('Invalid amount. Amount must be a positive number.');
    }
    return numAmount;
};

module.exports = {
    formatToRupees,
    parseRupees,
    validateAmount
}; 