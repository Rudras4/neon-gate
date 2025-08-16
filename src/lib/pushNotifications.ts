import { notificationsAPI } from './api';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isSupported: boolean;
  private permission: NotificationPermission = 'default';
  private subscription: PushSubscription | null = null;

  private constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        // Subscribe to push notifications on backend
        await this.subscribeToBackend();
      }
      
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission denied');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click events
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public async showEventReminder(eventTitle: string, eventTime: string): Promise<void> {
    await this.showNotification('Event Reminder', {
      body: `${eventTitle} starts in 1 hour`,
      tag: 'event-reminder',
      data: { type: 'event-reminder', eventTitle, eventTime },
    });
  }

  public async showTicketUpdate(ticketId: string, message: string): Promise<void> {
    await this.showNotification('Ticket Update', {
      body: message,
      tag: `ticket-${ticketId}`,
      data: { type: 'ticket-update', ticketId, message },
    });
  }

  public async showEventUpdate(eventTitle: string, updateMessage: string): Promise<void> {
    await this.showNotification('Event Update', {
      body: `${eventTitle}: ${updateMessage}`,
      tag: 'event-update',
      data: { type: 'event-update', eventTitle, updateMessage },
    });
  }

  public isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  private async subscribeToBackend(): Promise<void> {
    try {
      // Register service worker for push notifications
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || ''),
      });

      // Send subscription to backend
      await notificationsAPI.subscribeToPushNotifications(subscription);
      this.subscription = subscription;
      
      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public async unsubscribe(): Promise<void> {
    if (this.subscription) {
      try {
        await notificationsAPI.unsubscribeFromPushNotifications(this.subscription.endpoint);
        await this.subscription.unsubscribe();
        this.subscription = null;
        console.log('Successfully unsubscribed from push notifications');
      } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
      }
    }
  }
}

export default PushNotificationService.getInstance();
