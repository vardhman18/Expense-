import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Summary from '../components/Summary';
import Chart from '../components/Chart';
import SpendingSummary from '../components/SpendingSummary';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import ImportExport from '../components/ImportExport';
import BackupRestore from '../components/BackupRestore';
import { 
  getTransactions, 
  getCategories, 
  getBillReminders,
  getSavingsGoals,
  getBudgetAnalytics,
  getUser,
  logout,
  addTransaction,
  formatCurrency
} from '../config/api';
import RecentActivity from '../components/RecentActivity';
import SpendingChart from '../components/SpendingChart';
import { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [billReminders, setBillReminders] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [error, setError] = useState(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  // Get user data on mount
  useEffect(() => {
    const userData = getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
  }, [navigate]);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        transactionsData,
        categoriesData,
        remindersData,
        goalsData,
        analyticsData
      ] = await Promise.all([
        getTransactions(),
        getCategories(),
        getBillReminders(),
        getSavingsGoals(),
        getBudgetAnalytics()
      ]);

      // Sort transactions by date in descending order and ensure unique IDs
      const sortedTransactions = transactionsData
        .map((transaction, index) => ({
          ...transaction,
          id: transaction.id || `transaction-${index}`,
          date: transaction.date || new Date().toISOString()
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedTransactions);
      setCategories(categoriesData || []);
      setBillReminders(remindersData || []);
      setSavingsGoals(goalsData || []);
      setAnalytics(analyticsData || null);
    } catch (error) {
      toast.error('Failed to load data');
      if (error.message === 'Session expired. Please login again.') {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = async (formData) => {
    try {
      await addTransaction(formData);
      toast.success('Transaction added successfully');
      setIsFormVisible(false);
      await loadData(); // Always reload from backend
    } catch (error) {
      toast.error(error.message || 'Failed to add transaction');
    }
  };

  const calculateSummary = () => {
    return transactions.reduce((acc, transaction) => {
      if (!transaction || typeof transaction.amount === 'undefined') {
        return acc;
      }
      const amount = parseFloat(transaction.amount);
      if (isNaN(amount)) {
        return acc;
      }
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });
  };

  const { totalIncome, totalExpenses } = calculateSummary();
  const netSavings = totalIncome - totalExpenses;

  // Get only the most recent transactions for the Recent Activity component
  const recentTransactions = transactions.slice(0, 5);

  // Get upcoming bills
  const upcomingBills = billReminders
    ?.filter(bill => bill.status === 'pending')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  // Get active savings goals
  const activeGoals = savingsGoals
    ?.filter(goal => goal.progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const handleTransactionAdded = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    setIsAddingTransaction(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-900 text-white">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8">
            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Charts */}
              <div className="md:col-span-2 space-y-8">
                {/* Summary Section */}
                <Summary transactions={transactions} />

                {/* Charts and Analytics */}
                <div className="grid md:grid-cols-2 gap-8">
                  <Chart transactions={transactions} />
                  <SpendingSummary transactions={transactions} />
                </div>
              </div>

              {/* Right Column - Activity Feed */}
              <div className="space-y-8">
                {/* Recent Transactions */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {recentTransactions.map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-medium ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/transactions')}
                      className="w-full mt-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      View All Transactions
                    </button>
                  </div>
                </div>

                {/* Upcoming Bills */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h2 className="text-xl font-bold mb-4">Upcoming Bills</h2>
                  <div className="space-y-4">
                    {upcomingBills?.map(bill => (
                      <div key={bill.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{bill.name}</p>
                          <p className="text-sm text-gray-400">
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-medium text-yellow-400">
                          ${bill.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/bill-reminders')}
                      className="w-full mt-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      View All Bills
                    </button>
                  </div>
                </div>

                {/* Savings Goals */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h2 className="text-xl font-bold mb-4">Savings Goals</h2>
                  <div className="space-y-4">
                    {activeGoals?.map(goal => (
                      <div key={goal.id}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{goal.name}</p>
                          <span className="text-sm text-blue-400">{goal.progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          />
                        </div>
          </div>
        ))}
                    <button
                      onClick={() => navigate('/savings-goals')}
                      className="w-full mt-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      View All Goals
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Add Transaction */}
                <button
                    onClick={() => setIsFormVisible(true)}
                    className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors"
                >
                    <h3 className="text-lg font-medium">Add Transaction</h3>
                    <p className="text-sm text-gray-400 mt-2">Record a new transaction</p>
                </button>

                {/* Split Expenses */}
                <button
                    onClick={() => navigate('/expense-splits')}
                    className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors"
                >
                    <h3 className="text-lg font-medium">Split Expenses</h3>
                    <p className="text-sm text-gray-400 mt-2">Share and track group expenses</p>
                </button>

                {/* View Analytics */}
                <button
                    onClick={() => navigate('/analytics')}
                    className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors"
                >
                    <h3 className="text-lg font-medium">View Analytics</h3>
                    <p className="text-sm text-gray-400 mt-2">Deep dive into your finances</p>
                </button>

                {/* Set Goals */}
                <button
                    onClick={() => navigate('/goals')}
                    className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors"
                >
                    <h3 className="text-lg font-medium">Set Goals</h3>
                    <p className="text-sm text-gray-400 mt-2">Plan your financial future</p>
                </button>
      </div>

            {/* Data Management Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <ImportExport 
                  transactions={transactions}
                  onImport={loadData}
                />
              </div>
              <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                <BackupRestore 
                  onExport={loadData}
                />
        </div>
      </div>
    </div>
        </main>

        {/* Transaction Form Modal */}
        <Modal
            isOpen={isFormVisible}
            onClose={() => setIsFormVisible(false)}
            title="Add Transaction"
        >
            <TransactionForm
                onTransactionAdded={handleTransactionSubmit}
                onClose={() => setIsFormVisible(false)}
            />
        </Modal>
      </div>
    </>
  );
};

export default Dashboard; 