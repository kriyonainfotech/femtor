import React, { useState } from 'react';
import { MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';

// Main Reusable DataTable Component
const DataTable = ({ title, columns, data, renderActions, headerButton }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // --- Sorting Logic ---
    const sortedData = React.useMemo(() => {
        let sortableData = [...data];
        if (sortConfig.key !== null) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableData;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // --- Component ---
    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                {/* Conditionally render the button if the prop exists */}
                {headerButton && (
                    <button
                        onClick={headerButton.onClick}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        {headerButton.label}
                    </button>
                )}
            </header>
            <div className="p-3">
                <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                        <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.accessor} className="p-2 whitespace-nowrap">
                                        <div
                                            className="font-semibold text-left cursor-pointer flex items-center gap-2"
                                            onClick={() => col.sortable && requestSort(col.accessor)}
                                        >
                                            {col.header}
                                            {col.sortable && sortConfig.key === col.accessor && (
                                                <span>{sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {renderActions && <th className="p-2 whitespace-nowrap"><div className="font-semibold text-center">Actions</div></th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                            {sortedData.map((row, index) => (
                                <tr key={row.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    {columns.map((col) => (
                                        <td key={col.accessor} className="p-2 whitespace-nowrap">
                                            {col.cell
                                                ? col.cell(row, index)
                                                : <div className="text-left text-gray-800 dark:text-gray-200">{row[col.accessor]}</div>}
                                        </td>
                                    ))}
                                    {renderActions && (
                                        <td className="p-2 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                {renderActions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components for custom cells ---

// Generic Status Badge
export const StatusBadge = ({ status, colorMap }) => {
    const defaultColorMap = {
        active: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
        inactive: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
    };
    const finalColorMap = { ...defaultColorMap, ...colorMap };
    const color = finalColorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

// Generic Toggle Switch
export const ToggleSwitch = ({ enabled, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={enabled} onChange={onChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-blue-600"></div>
        </label>
    );
};


// Generic Action Menu Dropdown
export const ActionMenu = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <MoreVertical size={20} />
            </button>
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <ul className="py-1">
                        {items.map((item) => (
                            <li key={item.label}>
                                <a
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); item.onClick(); setIsOpen(false); }}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-white"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DataTable;
