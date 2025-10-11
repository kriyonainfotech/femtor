import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 m-4">
                <header className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </header>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
