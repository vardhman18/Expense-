import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    {/* Modal Panel */}
                    <div 
                        className={`
                            relative w-full transform overflow-hidden bg-gray-900 shadow-xl transition-all
                            ${isMobile ? 'rounded-t-xl max-w-full mt-auto mb-0' : 'rounded-xl max-w-lg m-auto'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile Pull Handle */}
                        {isMobile && (
                            <div className="absolute top-0 inset-x-0 flex justify-center pt-2 pb-1">
                                <div className="w-12 h-1.5 bg-gray-700 rounded-full"/>
                            </div>
                        )}

                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 ${isMobile ? 'pt-6' : 'pt-4'} pb-4 border-b border-gray-800`}>
                            <h3 className="text-lg font-medium text-white">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
                            >
                                <svg 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M6 18L18 6M6 6l12 12" 
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal; 