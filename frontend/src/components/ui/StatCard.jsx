import React from 'react';

const StatCard = ({ title, value, icon, change, changeType }) => {
    const isPositive = changeType === 'positive';
    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-between hover:border-indigo-500 transition-all duration-300">
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                <div className={`text-xs flex items-center mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '▲' : '▼'} {change} vs last month
                </div>
            </div>
            <div className="bg-gray-700 p-3 rounded-full">
                {icon}
            </div>
        </div>
    );
};

export default StatCard;