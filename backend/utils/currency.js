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

const USD_CONVERSION_RATE = 83; // 1 USD = 83 INR

const formatToUSD = (amount) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.abs(amount));
    return formattedAmount;
};

const convertINRtoUSD = (amountInINR) => {
    return amountInINR / USD_CONVERSION_RATE;
};

module.exports = {
    formatToRupees,
    parseRupees,
    validateAmount,
    formatToUSD,
    convertINRtoUSD
}; 