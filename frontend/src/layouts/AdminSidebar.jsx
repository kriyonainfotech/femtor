// src/layouts/AdminSidebar.jsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Users, LayoutDashboard, PanelLeft } from "lucide-react";

const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Users", path: "/manage-users", icon: <Users size={20} /> },
    { name: "Coaches", path: "/manage-coaches", icon: <Users size={20} /> },
    { name: "Categories", path: "/manage-category", icon: <Users size={20} /> },
    { name: "Courses", path: "/manage-courses", icon: <Users size={20} /> },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, isCollapsed }) {
    const location = useLocation();

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed z-40 inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out 
                    md:translate-x-0 
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    ${isCollapsed ? "md:w-20" : "md:w-64"}`}
            >
                <div className={`flex items-center border-b border-gray-200 dark:border-gray-700 h-16 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
                    {!isCollapsed ? (
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Admin</h1>
                    ) : (
                        <PanelLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    )}
                    <button className="text-gray-600 md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X size={22} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isCollapsed ? 'justify-center' : ''
                                } ${location.pathname === item.path
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                                }`}
                            // On mobile, clicking a link should close the sidebar
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                        >
                            {item.icon}
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}