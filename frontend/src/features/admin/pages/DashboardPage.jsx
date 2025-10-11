import React from 'react';
import { Users, Video, DollarSign, BarChart2, MoreHorizontal, ArrowUpRight, ArrowDownRight, ShoppingCart, UserCheck } from 'lucide-react';

// --- Reusable Components specific to this Dashboard ---

// Stat Card Component
const StatCard = ({ title, value, icon, change, changeType }) => {
    const IconComponent = icon;
    const isPositive = changeType === 'positive';
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400`}>
                    <IconComponent size={24} />
                </div>
            </div>
            <div className="flex items-center gap-1 text-sm mt-4">
                <span className={`flex items-center font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {change}
                </span>
                <span className="text-gray-500 dark:text-gray-400">vs last month</span>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
export default function DashboardPage() {
    // Dummy Data
    const stats = [
        { title: 'Total Revenue', value: '₹4,82,590', icon: DollarSign, change: '12.5%', changeType: 'positive' },
        { title: 'Total Users', value: '12,482', icon: Users, change: '8.2%', changeType: 'positive' },
        { title: 'Courses Sold', value: '1,204', icon: ShoppingCart, change: '2.1%', changeType: 'negative' },
        { title: 'Active Coaches', value: '73', icon: UserCheck, change: '5', changeType: 'positive' },
    ];

    const recentActivity = [
        { user: 'Anjali Sharma', course: 'Advanced Contouring', amount: '₹1,499', time: '5m ago' },
        { user: 'Rohan Mehta', course: 'Beginner Nail Art', amount: '₹799', time: '1h ago' },
        { user: 'Priya Patel', course: 'Skincare Essentials', amount: '₹999', time: '3h ago' },
        { user: 'Vikram Singh', course: 'Advanced Contouring', amount: '₹1,499', time: '8h ago' },
    ];

    const topArtists = [
        { name: 'Makeup Maven', courses: 15, sales: '₹1,20,500', avatar: 'https://placehold.co/40x40/a2d2ff/ffffff?text=MM' },
        { name: 'NailArt Pro', courses: 22, sales: '₹95,800', avatar: 'https://placehold.co/40x40/ffafcc/ffffff?text=NP' },
        { name: 'Hair Guru', courses: 8, sales: '₹72,300', avatar: 'https://placehold.co/40x40/fcca46/ffffff?text=HG' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, Admin! 👋</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's a snapshot of your makeup learning platform's performance.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Sales Chart & Top Artists */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Sales Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sales Analytics</h3>
                            <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-2 rounded-full"><MoreHorizontal size={20} /></button>
                        </div>
                        <div className="h-72 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <BarChart2 size={48} className="text-gray-400 dark:text-gray-500" />
                            <p className="ml-4 text-gray-400 dark:text-gray-500">Sales Chart Placeholder</p>
                        </div>
                    </div>

                    {/* Top Performing Artists */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-6">Top Performing Artists</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-100 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Artist</th>
                                        <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Courses</th>
                                        <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Total Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topArtists.map(artist => (
                                        <tr key={artist.name} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <img src={artist.avatar} alt={artist.name} className="w-10 h-10 rounded-full" />
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{artist.name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{artist.courses}</td>
                                            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">₹{artist.sales}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <ShoppingCart size={18} className="text-gray-500 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{activity.user} purchased "{activity.course}"</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                </div>
                                <p className="text-sm font-bold text-green-500">{activity.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
