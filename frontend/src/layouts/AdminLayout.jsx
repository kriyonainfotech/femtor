import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import Header from "../components/Header";

const AdminLayout = () => {
    // State for mobile sidebar (overlay)
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // State for desktop sidebar (collapsed/expanded)
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar Component */}
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isCollapsed={isCollapsed}
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                    // This logic is crucial for pushing the content
                    isCollapsed ? "md:ml-20" : "md:ml-64"
                    }`}
            >
                <Header
                    setSidebarOpen={setSidebarOpen}
                    setIsCollapsed={setIsCollapsed}
                />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
