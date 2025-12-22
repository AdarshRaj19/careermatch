
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BriefcaseIcon, BookOpenIcon, BrainCircuitIcon, BookmarkIcon, SettingsIcon, UserIcon } from './icons/Icon';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { path: 'profile', label: 'Profile', icon: UserIcon },
    { path: 'internships', label: 'Internships', icon: BriefcaseIcon },
    { path: 'preferences', label: 'Preferences', icon: BriefcaseIcon },
    { path: 'documents', label: 'Documents', icon: BriefcaseIcon },
    { path: 'allocation', label: 'Allocation', icon: BriefcaseIcon },
    { path: 'notifications', label: 'Notifications', icon: BriefcaseIcon },
    { path: 'courses', label: 'Courses', icon: BookOpenIcon },
    { path: 'ai-advisor', label: 'AI Advisor', icon: BrainCircuitIcon },
    { path: 'saved', label: 'Saved', icon: BookmarkIcon },
];

const StudentSidebar: React.FC = () => {
    const { user } = useAuth();
    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 transition-all duration-200 rounded-lg font-medium";
    const activeLinkClasses = "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg";
    const inactiveLinkClasses = "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    return (
        <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center px-2 mb-8">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
                    <BriefcaseIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">CareerMatch</h2>
            </div>
            
            <nav className="flex flex-col flex-1 space-y-1">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="ml-3">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                 <div className="flex items-center p-3 mb-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                       {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>
                <NavLink
                    to="/student/profile" 
                    className={`${baseLinkClasses} ${inactiveLinkClasses}`}
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span className="ml-3">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default StudentSidebar;
