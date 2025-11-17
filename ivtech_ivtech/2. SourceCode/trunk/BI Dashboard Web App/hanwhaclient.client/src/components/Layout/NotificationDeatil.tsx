import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Typography, IconButton } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import { GridCloseIcon } from '@mui/x-data-grid';
import format from 'date-fns/format';

import { INotification } from '../../interfaces/Inotifications';
import { GetNotification, GetUserNotificationCount, MarkReadUserNotificationService } from '../../services/notificationServices';
import { UpdateEventLogsStatusService } from '../../services/cameraService';
import { HasPermission } from '../../utils/screenAccessUtils';
import { LABELS } from '../../utils/constants';
import { formatNumber } from '../../utils/formatNumber';

interface NotificationDetailProps {
  onClose: () => void;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  triggerBellAnimation: () => void;
  notifications: INotification[];
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
  isDrawerOpen: boolean;
  fetchUnreadCount: () => void;
}

const NotificationDeatil: React.FC<NotificationDetailProps> = ({
  onClose,
  unreadCount,
  setUnreadCount,
  notifications,
  setNotifications,
  isDrawerOpen,
  fetchUnreadCount
}) => {
    const canAcknowledge = HasPermission(LABELS.Acknowledge_Notification);
  // const [notifications, setNotifications] = useState<INotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // const [unreadCount, setUnreadCount] = useState(0);

  const userProfileString = localStorage.getItem('userProfile');
  const userId = JSON.parse(userProfileString || '{}')?.id;
  const [renderKey, setRenderKey] = useState(0);


  const fetchNotifications = useCallback(async (pageNum: number) => {
    try {
      const suburl = `?pageNo=${pageNum}&pageSize=10`;
      const response = await GetNotification(suburl);

      if (Array.isArray(response)) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.notificationId));
          const newItems = response.filter(n => !existingIds.has(n.notificationId));
          return [...prev, ...newItems];
        });
        setHasMore(response.length === 10);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [setNotifications]);

  useEffect(() => {
    if (isDrawerOpen) {
      setPage(1);
      // setNotifications([]);
      // fetchNotifications(1); // commented this line for multiple call of fetch notification
      fetchUnreadCount();
    }
  }, [isDrawerOpen, fetchNotifications, setNotifications]);

  useEffect(() => {
    fetchNotifications(page);
  }, [fetchNotifications, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loaderRef.current, hasMore, notifications.length]);

  const markAsRead = async (notificationId: string) => {
    try {
      const payload = { notificationId, userId };
      await MarkReadUserNotificationService(payload);

      setNotifications(prev =>
        prev.map(item =>
          item.notificationId === notificationId ? { ...item, isRead: true } : item
        )
      );

      const target = notifications.find(n => n.notificationId === notificationId);
      if (target && !target.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const payload = { notificationId: "", userId };
      const response = await MarkReadUserNotificationService(payload);


      if (typeof response !== "string" && response?.isSuccess) {
        const updatedNotifications = notifications.map(item => ({
          ...item,
          isRead: true
        }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
        setRenderKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const acknowledgeNotification = async (e: React.MouseEvent, ID: string) => {
    e.stopPropagation();
    try {
      const payload = { deviceEventId: ID };
      await UpdateEventLogsStatusService(payload);

      setNotifications(prev =>
        prev.map(item =>
          item.actionParameter === ID
            ? { ...item, actionName: 'Acknowledged' }
            : item
        )
      );
    } catch (error) {
      console.error("Error acknowledging event log:", error);
    }
  };

  return (
    <div className="notification-wrapper">
      <div className="notification-header">
        <Typography variant="h6" className="notification-title">
          Notification <span>({formatNumber(unreadCount)})</span>
        </Typography>
        <div className="notification-actions">
          {notifications.length > 0 && (
            <button className="read-all-btn" onClick={markAllAsRead}>
              <VisibilityOutlined />
              Read All
            </button>
          )}
          <IconButton className="close-btn" onClick={onClose}>
            <GridCloseIcon />
          </IconButton>
        </div>
      </div>

      <div className="notification-body" key={renderKey} >
        {notifications.length === 0 ? (
          <div className="no-notification">
            <div className="no-noti-wrpper">
              <img src='/images/No_Notification.svg' alt="No notification" />
              <p>No notifications available at the moment.</p>
            </div>
          </div>
        ) : (
          <>
            {notifications.map(item => (
              <div
                key={item.notificationId}
                className={item.isRead ? "notification-card" : "notification-card-read"}
                onClick={() => !item.isRead && markAsRead(item.notificationId)}
              >
                <div className="notification-card-data">
                  <strong>{item.title}</strong>
                  <p>{item.content}</p>
                  <p>
                    {item.createdOn && !isNaN(new Date(item.createdOn).getTime())
                      ? format(new Date(item.createdOn), 'dd MMM yyyy, hh:mm a')
                      : 'Invalid date'}
                  </p>
                </div>

                {item.actionName === 'Acknowledge' && canAcknowledge  && (
                  <IconButton onClick={(e) => acknowledgeNotification(e, item.actionParameter)}>
                    <div className="noti-thumb-i">
                      <img src="/images/notification_thumb.svg" alt="thumb" />
                    </div>
                  </IconButton>
                )}
                {item.actionName === 'Acknowledged' && (
                  <div className="noti-thumb-i">
                    <img src="/images/notification_thumb_green.svg" alt="thumb-acknowledged" />
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <div
                ref={loaderRef}
                style={{ margin: '15px', height: '40px' }}
              >
                Loading more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { NotificationDeatil };
