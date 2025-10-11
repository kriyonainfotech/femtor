import React from 'react';

const Input = (props) => (
    <input
        className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
        {...props}
    />
);

export default Input;