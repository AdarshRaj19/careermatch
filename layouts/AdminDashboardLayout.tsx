
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ChevronDownIcon, LogOutIcon, MenuIcon } from '../components/icons/Icon';

const AdminDashboardLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="relative flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <div className="hidden sm:block">
                <AdminSidebar />
            </div>

            {isSidebarOpen && (
                <div className="fixed inset-0 z-40 sm:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                    <div className="relative h-full w-72">
                        <AdminSidebar className="w-full h-full" />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center px-4 py-4 sm:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="sm:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation menu"
                        >
                            <MenuIcon className="h-5 w-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <ThemeSwitcher />
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-gray-600 dark:text-gray-300 hidden sm:inline">{user?.name}</span>
                                <ChevronDownIcon className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <LogOutIcon className="h-4 w-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
