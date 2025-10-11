import React from "react";

const Button = ({ children, isLoading, ...props }) => (
    <button
        className="w-full px-4 py-2 font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        disabled={isLoading}
        {...props}
    >
        {isLoading ? 'Signing In...' : children}
    </button>
);

export default Button;