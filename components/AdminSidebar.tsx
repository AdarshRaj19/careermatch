
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BriefcaseIcon, LayoutDashboardIcon, BookOpenIcon, FileUpIcon, SlidersHorizontalIcon, CheckSquareIcon, ShieldCheckIcon, FlaskConicalIcon, FileTextIcon, SettingsIcon, UserIcon } from './icons/Icon';

const adminNavItems = [
    { path: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    { path: 'manage-courses', label: 'Manage Courses', icon: BookOpenIcon },
    { path: 'manage-internships', label: 'Manage Internships', icon: BriefcaseIcon },
    { path: 'manage-students', label: 'Manage Students', icon: UserIcon },
    { path: 'data-upload', label: 'Data Upload', icon: FileUpIcon },
    { path: 'allocation-engine', label: 'Allocation Engine', icon: SlidersHorizontalIcon },
    { path: 'results', label: 'Results Dashboard', icon: CheckSquareIcon },
    { path: 'fairness-report', label: 'Fairness Report', icon: ShieldCheckIcon },
    { path: 'what-if-simulator', label: 'What-If Simulator', icon: FlaskConicalIcon },
    { path: 'audit-logs', label: 'Audit & Logs', icon: FileTextIcon },
];

const AdminSidebar: React.FC = () => {
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
                {adminNavItems.map(item => (
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
                <NavLink
                    to="settings"
                    className={({ isActive }) =>
                        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                    }
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span className="ml-3">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default AdminSidebar;
