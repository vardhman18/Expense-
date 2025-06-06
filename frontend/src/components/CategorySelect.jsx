import React, { useState, useEffect } from 'react';
import { categories } from '../utils/categories';

const CategorySelect = ({ type, value, onChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedCategory = categories[type]?.find(cat => cat.id === value);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const CategoryItem = ({ category }) => (
        <button
            type="button"
            onClick={() => {
                onChange(category.id);
                setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700/50 transition-colors ${
                value === category.id ? 'bg-blue-500/10 text-blue-400' : 'text-white'
            }`}
        >
            <span className="text-2xl">{category.icon}</span>
            <span className="font-medium">{category.label}</span>
        </button>
    );

    return (
        <div className="relative">
            {/* Selected Category Display / Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-700/50 border ${
                    error ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-left flex items-center justify-between focus:outline-none focus:border-blue-500 transition-colors`}
            >
                <div className="flex items-center gap-2">
                    {selectedCategory ? (
                        <>
                            <span className="text-xl">{selectedCategory.icon}</span>
                            <span className="text-white">{selectedCategory.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">Select a category</span>
                    )}
                </div>
                <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Categories Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Categories List - Desktop Dropdown / Mobile Bottom Sheet */}
                    {isMobile ? (
                        <div 
                            className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${
                                isOpen ? 'translate-y-0' : 'translate-y-full'
                            }`}
                        >
                            <div className="bg-gray-900 rounded-t-xl shadow-xl max-h-[80vh] overflow-hidden">
                                {/* Handle */}
                                <div className="flex justify-center pt-2 pb-4">
                                    <div className="w-12 h-1.5 bg-gray-700 rounded-full"/>
                                </div>
                                
                                {/* Header */}
                                <div className="px-4 pb-4 flex items-center justify-between border-b border-gray-800">
                                    <h3 className="text-lg font-medium text-white">Select Category</h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Categories Grid */}
                                <div className="p-4 grid grid-cols-2 gap-2 max-h-[calc(80vh-100px)] overflow-y-auto">
                                    {categories[type]?.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                onChange(category.id);
                                                setIsOpen(false);
                                            }}
                                            className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                                                value === category.id 
                                                    ? 'bg-blue-500/10 text-blue-400' 
                                                    : 'bg-gray-800/50 text-white hover:bg-gray-700/50'
                                            }`}
                                        >
                                            <span className="text-3xl">{category.icon}</span>
                                            <span className="font-medium text-sm text-center">{category.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute left-0 right-0 mt-2 py-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
                            {categories[type]?.map(category => (
                                <CategoryItem key={category.id} category={category} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CategorySelect; 