import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const SidePanel = ({ title, isOpen, onClose, children }) => {
    // Effect to handle the body scroll lock when the panel is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Cleanup function to restore scroll on component unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 bg-black/60 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Side Panel Container */}
            <div
                className={`absolute inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidePanel;
