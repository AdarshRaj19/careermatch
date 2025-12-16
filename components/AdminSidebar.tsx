
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
    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 transform rounded-lg";
    const activeLinkClasses = "bg-blue-100 text-blue-700";
    const inactiveLinkClasses = "hover:bg-gray-200 hover:text-gray-700";
    
    return (
        <aside className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
            <div className="flex items-center px-2">
                <BriefcaseIcon className="w-8 h-8 text-blue-600" />
                <h2 className="ml-2 text-2xl font-bold text-gray-800">CareerMatch</h2>
            </div>
            
            <nav className="flex flex-col flex-1 mt-10 space-y-2">
                {adminNavItems.map(item => (
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
                <NavLink
                    to="settings"
                    className={({ isActive }) =>
                        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses} mt-2`
                    }
                >
                    <SettingsIcon className="w-5 h-5" />
                    <span className="mx-4 font-medium">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default AdminSidebar;
