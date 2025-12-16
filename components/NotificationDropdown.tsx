
import React, { useState, useEffect, useCallback } from 'react';
import { BellIcon } from './icons/Icon';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

interface Notification {
    id: number;
    title: string;
    text: string;
    is_read: boolean;
    created_at: string;
}

const NotificationDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const summary = await api.get('/student/notifications/summary');
            setUnreadCount(summary.unreadCount);
            setNotifications(summary.recent);
        } catch (error) {
            console.error("Failed to fetch notification summary", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleMarkAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        try {
            await api.post('/student/notifications/mark-read', { notificationId: id });
        } catch (error) {
            // Revert on failure
            fetchData();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="p-3 border-b dark:border-gray-700 font-semibold text-sm">Notifications</div>
                    <div className="py-1 max-h-80 overflow-y-auto">
                        {loading ? <p className="p-3 text-sm text-gray-500">Loading...</p> : notifications.length === 0 ? (
                            <p className="p-3 text-sm text-center text-gray-500">No new notifications.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start ${!n.is_read ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{n.title}</p>
                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{n.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                                    </div>
                                    {!n.is_read && (
                                        <button onClick={() => handleMarkAsRead(n.id)} className="ml-2 mt-1 p-1 rounded-full bg-blue-500" title="Mark as read">
                                            <span className="sr-only">Mark as read</span>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <Link to="/student/notifications" className="block text-center p-2 border-t dark:border-gray-700 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        View all notifications
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
