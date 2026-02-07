'use client';

import { useNotification, type NotificationType } from '@/lib/notification-context';
import { useEffect, useState } from 'react';

const notificationStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: '✓',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: '⚠',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
};

interface SingleNotificationProps {
  id: string;
  message: string;
  type: NotificationType;
  title?: string;
  onClose: (id: string) => void;
}

function SingleNotification({
  id,
  message,
  type,
  title,
  onClose,
}: SingleNotificationProps) {
  const styles = notificationStyles[type];

  return (
    <div
      className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex items-start gap-3 animate-slide-in`}
    >
      <div className={`${styles.iconBg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
        <span className={`${styles.iconColor} font-bold text-sm`}>{styles.icon}</span>
      </div>
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${styles.text}`}>{title}</h3>}
        <p className={styles.text}>{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${styles.text} hover:opacity-70 transition flex-shrink-0 font-bold text-lg`}
      >
        ✕
      </button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full px-4 sm:px-0">
      {notifications.map((notification) => (
        <SingleNotification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          title={notification.title}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}
