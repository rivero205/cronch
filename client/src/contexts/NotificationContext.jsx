import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext({});

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const { showInfo, showSuccess, showWarning, showError } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const businessId = profile?.business_id;

    useEffect(() => {
        if (!businessId) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        // Request Browser Permissions (if supported and not already denied)
        if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        fetchNotifications();
        checkDailyClosingReminder();

        // Subscribe to Realtime changes
        const subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `business_id=eq.${businessId}`
                },
                (payload) => {
                    handleNewNotification(payload.new);
                }
            )
            .subscribe();

        // Setup Interval for Daily Reminder (Every 30 minutes check)
        const reminderInterval = setInterval(() => {
            checkDailyClosingReminder();
        }, 30 * 60 * 1000);

        return () => {
            supabase.removeChannel(subscription);
            clearInterval(reminderInterval);
        };
    }, [businessId]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('business_id', businessId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            setNotifications(data || []);
            countUnread(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check if we should remind the user to close the day
    const checkDailyClosingReminder = async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Trigger at or after 12:55 AM (Bogota time)
        // Note: now.getHours() uses the browser's local time, which is Bogota time for the user.
        if (currentHour === 0 && currentMinute < 55) return;
        // If it's before midnight (e.g. 11 PM), we don't trigger yet for the "next day's" 12:55 AM
        // This logic assumes they want the reminder early in the morning of the day.

        const todayStr = now.toISOString().split('T')[0];
        const lastReminded = localStorage.getItem(`closing_reminder_${todayStr}`);

        if (!lastReminded) {
            // Remind the user to enter data
            const title = '🔔 Recordatorio: Registra tu día';
            const body = 'Son las 12:55 AM. No olvides registrar todas las ventas, gastos y producción de hoy.';

            // Send Native Browser Notification
            showBrowserNotification(title, body);

            // Show In-App Toast
            showInfo('Recordatorio: Ingresa todos los datos del día (Ventas, Gastos, Producción).');

            // Mark as reminded for today so we don't spam
            localStorage.setItem(`closing_reminder_${todayStr}`, 'true');
        }
    };

    const countUnread = (list) => {
        const count = list.filter(n => !n.is_read).length;
        setUnreadCount(count);
    };

    const showBrowserNotification = (title, body) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body: body,
                    icon: '/AppIcons/playstore.png', // Corrected app icon
                    tag: 'cronch-reminder'
                });
            } catch (e) {
                console.error('Error showing browser notification:', e);
            }
        }
    };

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Native Browser Notification
        showBrowserNotification(notification.title, notification.message);

        // Toast
        switch (notification.type) {
            case 'success':
                showSuccess(notification.message);
                break;
            case 'warning':
                showWarning(notification.message);
                break;
            case 'error':
                showError(notification.message);
                break;
            default:
                showInfo(notification.message);
        }
    };

    const markAsRead = async (id) => {
        // Optimistic update
        const updatedList = notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        );
        setNotifications(updatedList);
        countUnread(updatedList);

        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert changes if needed? Usually low risk.
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const updatedList = notifications.map(n => ({ ...n, is_read: true }));
        setNotifications(updatedList);
        setUnreadCount(0);

        try {
            // Bulk update only unread ones to save resources? 
            // Or update all unread for this business.
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('business_id', businessId)
                .eq('is_read', false);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        // Optimistic update
        const updatedList = notifications.filter(n => n.id !== id);
        setNotifications(updatedList);
        countUnread(updatedList);

        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
