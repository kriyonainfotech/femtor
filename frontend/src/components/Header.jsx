// src/components/Header.jsx
import React from "react";
import { Menu, LogOut } from "lucide-react";
import ThemeToggle from "./ui/Themetoggle";
import { useAuth } from "../Context/AuthContext";

const Header = ({ setSidebarOpen, setIsCollapsed }) => {
    const { logout, user } = useAuth();

    const handleToggleSidebar = () => {
        if (window.innerWidth < 768) {
            // Mobile view: open/close sidebar
            setSidebarOpen((prev) => !prev);
        } else {
            // Desktop view: collapse/expand sidebar
            setIsCollapsed((prev) => !prev);
        }
    };

    return (
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-3 shadow-sm sticky top-0 z-10 h-16 transition-colors duration-300">
            {/* Left section — Logo + Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                    <Menu size={22} className="text-gray-700 dark:text-gray-200" />
                </button>

            </div>

            {/* Right section — Theme toggle + user */}
            <div className="flex items-center gap-4">
                {/* <ThemeToggle /> */}
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                    Hi, {user?.name || "Admin"} 👋
                </span>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 
                     dark:text-red-400 dark:hover:bg-red-800/40 transition-all"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
