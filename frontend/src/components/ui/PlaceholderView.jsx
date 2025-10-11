import React from 'react';

const PlaceholderView = ({ viewName }) => (
    <div className="p-6 text-center text-gray-500">
        <h2 className="text-2xl font-semibold text-white mb-4">{viewName}</h2>
        <p>This is a placeholder for the {viewName} page.</p>
        <p>Functionality and content can be built out here.</p>
    </div>
);

export default PlaceholderView;