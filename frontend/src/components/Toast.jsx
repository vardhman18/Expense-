import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'info':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📝';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
            <div className={`${getTypeStyles()} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3`}>
                <span>{getIcon()}</span>
                <p className="font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="ml-4 hover:text-gray-200"
                    aria-label="Close"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast; 