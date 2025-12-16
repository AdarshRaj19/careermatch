
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
    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 transition-colors duration-200 transform rounded-lg";
    const activeLinkClasses = "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
    const inactiveLinkClasses = "hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200";

    return (
        <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
            <div className="flex items-center px-2">
                <BriefcaseIcon className="w-8 h-8 text-blue-600" />
                <h2 className="ml-2 text-2xl font-bold text-gray-800 dark:text-gray-100">CareerMatch</h2>
            </div>
            
            <nav className="flex flex-col flex-1 mt-10 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="mx-4 font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto">
                 <div className="flex items-center p-2 space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                       {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">{user?.name}</h4>
                    </div>
                </div>
                <NavLink
                    to="/student/profile" 
                    className={`${baseLinkClasses} ${inactiveLinkClasses} mt-2`}
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span className="mx-4 font-medium">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default StudentSidebar;
