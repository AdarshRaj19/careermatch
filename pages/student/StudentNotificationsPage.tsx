
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { BellIcon, CheckSquareIcon, UserIcon, BriefcaseIcon, LoaderIcon, CheckIcon, XIcon } from '../../components/icons/Icon';
import { api } from '../../services/api';
import { NotificationSettings as SettingsType } from '../../types';

interface Notification {
    id: number;
    type: string;
    title: string;
    text: string;
    link: string | null;
    created_at: string;
}

const iconMap: { [key: string]: React.ElementType } = {
    'offer_accepted': CheckSquareIcon,
    'results': BellIcon,
    'match': BriefcaseIcon,
    'welcome': UserIcon,
    'default': BellIcon,
};

const actionMap: { [key: string]: { label: string } } = {
    'results': { label: 'View Results' },
    'match': { label: 'View Internships' },
    'welcome': { label: 'Complete Profile' }
};

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    const Icon = iconMap[type] || iconMap.default;
    return (
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-4">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
    );
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
            checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
    </button>
);

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/student/notification-settings');
                setSettings(response);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setStatus('saving');
        try {
            await api.put('/student/notification-settings', settings);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            setStatus('error');
             setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleSettingChange = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
    };

    const getSaveButtonContent = () => {
        switch (status) {
            case 'saving': return <><LoaderIcon className="w-4 h-4 mr-2 animate-spin" /> Saving...</>;
            case 'success': return <><CheckIcon className="w-4 h-4 mr-2" /> Saved!</>;
            case 'error': return <><XIcon className="w-4 h-4 mr-2" /> Error</>;
            default: return 'Save Settings';
        }
    };

    if (!settings) {
        return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><p>Loading settings...</p></div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Notification Settings</h2>
            <div className="mt-4 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-md bg-gray-50 dark:bg-gray-700/50">
                    <div>
                        <p className="font-semibold dark:text-gray-200">New Internship Alerts</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">Receive notifications for new internships that match your skills.</p>
                    </div>
                    <ToggleSwitch checked={settings.new_internship_alerts} onChange={(val) => handleSettingChange('new_internship_alerts', val)} />
                </div>

                {settings.new_internship_alerts && (
                    <div className="pl-4 border-l-2 dark:border-gray-700 space-y-4">
                        <div>
                            <p className="font-semibold dark:text-gray-200">Frequency</p>
                            <div className="flex space-x-4 mt-2">
                                {(['instant', 'daily', 'weekly'] as const).map(freq => (
                                    <label key={freq} className="flex items-center space-x-2">
                                        <input type="radio" name="frequency" value={freq} checked={settings.alert_frequency === freq} onChange={() => handleSettingChange('alert_frequency', freq)} className="form-radio text-blue-600" />
                                        <span className="capitalize dark:text-gray-300">{freq}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold dark:text-gray-200">Delivery Method</p>
                            <div className="flex space-x-4 mt-2">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={settings.alert_method_in_app} onChange={(e) => handleSettingChange('alert_method_in_app', e.target.checked)} className="form-checkbox text-blue-600" />
                                    <span className="dark:text-gray-300">In-App</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={settings.alert_method_email} onChange={(e) => handleSettingChange('alert_method_email', e.target.checked)} className="form-checkbox text-blue-600" />
                                    <span className="dark:text-gray-300">Email</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleSave} disabled={status === 'saving' || status === 'success'} variant={status === 'success' ? 'success' : 'primary'}>
                    {getSaveButtonContent()}
                </Button>
            </div>
        </div>
    );
};


const StudentNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/student/notifications');
                setNotifications(response);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <NotificationSettings />
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100">Recent Activity</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your recent notifications and alerts.</p>
                 <div className="mt-6 space-y-4">
                    {loading ? <p>Loading notifications...</p> : notifications.map(n => {
                        const action = actionMap[n.type];
                        return (
                            <div key={n.id} className="p-4 border dark:border-gray-700 rounded-lg flex items-start">
                                <NotificationIcon type={n.type} />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{n.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.text}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                                {action && n.link && (
                                    <Link to={n.link}><Button variant="outline" size="sm">{action.label}</Button></Link>
                                )}
                            </div>
                        );
                    })}
                     {!loading && notifications.length === 0 && <p className="text-center text-gray-500 py-8">You have no new notifications.</p>}
                 </div>
            </div>
        </div>
    );
};

export default StudentNotificationsPage;
