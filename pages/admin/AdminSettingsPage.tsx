import React from 'react';

const AdminSettingsPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Admin Settings
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Manage global configuration for the CareerMatch admin dashboard.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="p-4 border dark:border-gray-700 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        General
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Basic settings like cycle name and visibility.
                    </p>
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Current Allocation Cycle
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                placeholder="e.g. Summer 2025"
                                disabled
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                (Demo placeholder – wiring to backend config can be added later.)
                            </p>
                        </div>
                    </div>
                </section>

                <section className="p-4 border dark:border-gray-700 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Notifications
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Control default notification behavior for students.
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p>
                            Notification defaults are currently managed per student from the student
                            side. Centralized admin controls can be added here later.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminSettingsPage;


