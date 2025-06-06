import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logout } from '../config/api';

const Header = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    const isCurrentRoute = (path) => location.pathname === path;

    const NavLink = ({ to, children }) => (
        <button 
            onClick={() => {
                navigate(to);
                setIsMobileMenuOpen(false);
            }}
            className={`w-full md:w-auto px-4 py-2 md:py-1 rounded-lg transition-all duration-200 ${
                isCurrentRoute(to)
                    ? 'bg-blue-500/10 text-blue-400 font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <h1 
                            className="text-xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => navigate('/dashboard')}
                        >
                            BudgetBuddy
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/transactions">Transactions</NavLink>
                        <NavLink to="/goals">Goals</NavLink>
                        <NavLink to="/analytics">Analytics</NavLink>
                        <NavLink to="/savings-goals">Savings</NavLink>
                        <NavLink to="/bill-reminders">Bills</NavLink>
                        <NavLink to="/expense-splits">Split Expenses</NavLink>
                    </nav>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                            {user?.email || 'Guest'}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div 
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                    <div className="py-3 space-y-2">
                        <nav className="flex flex-col gap-2">
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <NavLink to="/transactions">Transactions</NavLink>
                            <NavLink to="/goals">Goals</NavLink>
                            <NavLink to="/analytics">Analytics</NavLink>
                            <NavLink to="/savings-goals">Savings</NavLink>
                            <NavLink to="/bill-reminders">Bills</NavLink>
                            <NavLink to="/expense-splits">Split Expenses</NavLink>
                        </nav>
                        
                        {/* Mobile User Menu */}
                        <div className="mt-4 pt-4 border-t border-gray-800/50">
                            <div className="flex items-center justify-between px-4 py-2">
                                <div className="text-sm text-gray-400">
                                    {user?.email || 'Guest'}
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 