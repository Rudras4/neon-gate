const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// API functions for different endpoints
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string) => {
    return apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },

  updateProfile: async (userData: any) => {
    return apiRequest<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

export const eventsAPI = {
  getAll: async () => {
    return apiRequest('/events');
  },

  getById: async (id: string) => {
    return apiRequest(`/events/${id}`);
  },

  create: async (eventData: any) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  update: async (id: string, eventData: any) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

export const ticketsAPI = {
  getUserTickets: async () => {
    return apiRequest('/tickets');
  },

  purchaseTicket: async (eventId: string, ticketData: any) => {
    return apiRequest('/tickets', {
      method: 'POST',
      body: JSON.stringify({ eventId, ...ticketData }),
    });
  },

  getTicketById: async (id: string) => {
    return apiRequest(`/tickets/${id}`);
  },

  getResaleTickets: async (eventId: string) => {
    return apiRequest(`/tickets/event/${eventId}/resale`);
  },

  purchaseResaleTicket: async (listingId: string, purchaseData: any) => {
    return apiRequest(`/tickets/resale/${listingId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  },

  listTicketForResale: async (ticketId: string, resaleData: any) => {
    return apiRequest(`/tickets/${ticketId}/resale`, {
      method: 'POST',
      body: JSON.stringify(resaleData),
    });
  },

  getUserResaleListings: async () => {
    return apiRequest('/tickets/my/resale');
  },

  cancelResaleListing: async (listingId: string) => {
    return apiRequest(`/tickets/resale/${listingId}`, {
      method: 'DELETE',
    });
  },

  // Ticket Tier Management APIs
  createTicketTier: async (eventId: string, tierData: any) => {
    return apiRequest(`/tickets/event/${eventId}/tiers`, {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  },

  updateTicketTier: async (tierId: string, tierData: any) => {
    return apiRequest(`/tickets/tiers/${tierId}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  },

  deleteTicketTier: async (tierId: string) => {
    return apiRequest(`/tickets/tiers/${tierId}`, {
      method: 'DELETE',
    });
  },

  getTicketTiers: async (eventId: string) => {
    return apiRequest(`/tickets/event/${eventId}/tiers`);
  },

  getTicketTierById: async (tierId: string) => {
    return apiRequest(`/tickets/tiers/${tierId}`);
  },

  updateTierAvailability: async (tierId: string, availability: any) => {
    return apiRequest(`/tickets/tiers/${tierId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify(availability),
    });
  },

  getTicketStatistics: async (eventId: string) => {
    return apiRequest(`/tickets/event/${eventId}/statistics`);
  },

  // Advanced Ticket Management APIs
  getTicketTransferHistory: async (ticketId: string) => {
    return apiRequest(`/tickets/${ticketId}/transfer-history`);
  },

  transferTicket: async (ticketId: string, transferData: any) => {
    return apiRequest(`/tickets/${ticketId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  },

  getTicketUpgrades: async (ticketId: string) => {
    return apiRequest(`/tickets/${ticketId}/upgrades`);
  },

  upgradeTicket: async (ticketId: string, upgradeData: any) => {
    return apiRequest(`/tickets/${ticketId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify(upgradeData),
    });
  },

  getTicketInsurance: async (ticketId: string) => {
    return apiRequest(`/tickets/${ticketId}/insurance`);
  },

  addTicketInsurance: async (ticketId: string, insuranceData: any) => {
    return apiRequest(`/tickets/${ticketId}/insurance`, {
      method: 'POST',
      body: JSON.stringify(insuranceData),
    });
  },

  getTicketAccessibility: async (ticketId: string) => {
    return apiRequest(`/tickets/${ticketId}/accessibility`);
  },

  updateTicketAccessibility: async (ticketId: string, accessibilityData: any) => {
    return apiRequest(`/tickets/${ticketId}/accessibility`, {
      method: 'PUT',
      body: JSON.stringify(accessibilityData),
    });
  },
};

export const usersAPI = {
  getProfile: async () => {
    return apiRequest('/users/profile');
  },

  updateProfile: async (userData: any) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getUserStats: async () => {
    return apiRequest('/users/stats');
  },

  getUserEvents: async () => {
    return apiRequest('/users/events');
  },

  getUserTickets: async () => {
    return apiRequest('/users/tickets');
  },

  // Advanced User Management APIs
  getUserPreferences: async () => {
    return apiRequest('/users/preferences');
  },

  updateUserPreferences: async (preferences: any) => {
    return apiRequest('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  getUserActivity: async (timeRange: string = '30d') => {
    return apiRequest(`/users/activity?timeRange=${timeRange}`);
  },

  getUserConnections: async () => {
    return apiRequest('/users/connections');
  },

  getUserRecommendations: async (limit: number = 10) => {
    return apiRequest(`/users/recommendations?limit=${limit}`);
  },

  getUserAchievements: async () => {
    return apiRequest('/users/achievements');
  },

  getUserBadges: async () => {
    return apiRequest('/users/badges');
  },

  getUserTimeline: async (timeRange: string = '30d') => {
    return apiRequest(`/users/timeline?timeRange=${timeRange}`);
  },
};

export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/categories');
  },

  getPopular: async () => {
    return apiRequest('/categories/popular');
  },

  create: async (categoryData: any) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Advanced Category Management APIs
  getCategoryAnalytics: async (categoryId: string, timeRange: string = '30d') => {
    return apiRequest(`/categories/${categoryId}/analytics?timeRange=${timeRange}`);
  },

  getCategoryTrends: async (categoryId: string, timeRange: string = '30d') => {
    return apiRequest(`/categories/${categoryId}/trends?timeRange=${timeRange}`);
  },

  getCategoryEvents: async (categoryId: string, timeRange: string = '30d') => {
    return apiRequest(`/categories/${categoryId}/events?timeRange=${timeRange}`);
  },

  getCategoryUsers: async (categoryId: string) => {
    return apiRequest(`/categories/${categoryId}/users`);
  },

  getCategoryRevenue: async (categoryId: string, timeRange: string = '30d') => {
    return apiRequest(`/categories/${categoryId}/revenue?timeRange=${timeRange}`);
  },

  getCategoryPerformance: async (categoryId: string, timeRange: string = '30d') => {
    return apiRequest(`/categories/${categoryId}/performance?timeRange=${timeRange}`);
  },

  getCategoryInsights: async (categoryId: string) => {
    return apiRequest(`/categories/${categoryId}/insights`);
  },

  getCategoryRecommendations: async (userId: string, limit: number = 10) => {
    return apiRequest(`/categories/recommendations/${userId}?limit=${limit}`);
  },
};

export const analyticsAPI = {
  getEventRevenue: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/revenue`);
  },

  getUserRevenue: async () => {
    return apiRequest('/analytics/user/revenue');
  },

  getEventMetrics: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/metrics`);
  },

  trackEvent: async (eventId: string, action: string) => {
    return apiRequest('/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ eventId, action }),
    });
  },

  getEventAnalytics: async (eventId: string, timeRange: string = '30d') => {
    return apiRequest(`/analytics/events/${eventId}?timeRange=${timeRange}`);
  },

  getUserBehavior: async (eventId?: string) => {
    const url = eventId ? `/analytics/behavior/${eventId}` : '/analytics/behavior';
    return apiRequest(url);
  },

  getAttendanceTracking: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/attendance`);
  },

  trackUserInteraction: async (eventId: string, interactionType: string, metadata?: any) => {
    return apiRequest('/analytics/interactions', {
      method: 'POST',
      body: JSON.stringify({ eventId, interactionType, metadata }),
    });
  },

  // Advanced Event Management APIs
  getEventSchedule: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/schedule`);
  },

  getEventCapacity: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/capacity`);
  },

  getEventWaitlist: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/waitlist`);
  },

  getEventFeedback: async (eventId: string, timeRange: string = '30d') => {
    return apiRequest(`/analytics/events/${eventId}/feedback?timeRange=${timeRange}`);
  },

  getEventSocialMetrics: async (eventId: string) => {
    return apiRequest(`/analytics/events/${eventId}/social`);
  },

  // Revenue Analytics APIs
  getRevenueAnalytics: async (timeRange: string = '30d', filters?: any) => {
    const params = new URLSearchParams({ timeRange });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/analytics/revenue?${params.toString()}`);
  },

  getRevenueBreakdown: async (eventId?: string, timeRange: string = '30d') => {
    const url = eventId 
      ? `/analytics/revenue/breakdown/${eventId}?timeRange=${timeRange}`
      : `/analytics/revenue/breakdown?timeRange=${timeRange}`;
    return apiRequest(url);
  },

  getRevenueTrends: async (timeRange: string = '30d', granularity: string = 'daily') => {
    return apiRequest(`/analytics/revenue/trends?timeRange=${timeRange}&granularity=${granularity}`);
  },

  getRevenueComparison: async (period1: string, period2: string) => {
    return apiRequest(`/analytics/revenue/comparison?period1=${period1}&period2=${period2}`);
  },

  exportRevenueReport: async (timeRange: string, format: string = 'csv') => {
    return apiRequest(`/analytics/revenue/export?timeRange=${timeRange}&format=${format}`);
  },

  // Attendance Tracking APIs
  getEventAttendance: async (eventId: string, date?: string) => {
    const url = date 
      ? `/analytics/attendance/events/${eventId}?date=${date}`
      : `/analytics/attendance/events/${eventId}`;
    return apiRequest(url);
  },

  getAttendanceStats: async (eventId: string, timeRange: string = '30d') => {
    return apiRequest(`/analytics/attendance/stats/${eventId}?timeRange=${timeRange}`);
  },

  trackAttendance: async (eventId: string, attendanceData: any) => {
    return apiRequest(`/analytics/attendance/track/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  },

  getAttendanceReport: async (eventId: string, format: string = 'csv') => {
    return apiRequest(`/analytics/attendance/report/${eventId}?format=${format}`);
  },

  getAttendanceTrends: async (eventId: string, timeRange: string = '30d') => {
    return apiRequest(`/analytics/attendance/trends/${eventId}?timeRange=${timeRange}`);
  },
};

export const notificationsAPI = {
  sendEmail: async (emailData: any) => {
    return apiRequest('/notifications/email', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  },

  sendEventUpdate: async (eventId: string, updateData: any) => {
    return apiRequest(`/notifications/events/${eventId}/update`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  },

  getNotificationPreferences: async () => {
    return apiRequest('/notifications/preferences');
  },

  updateNotificationPreferences: async (preferences: any) => {
    return apiRequest('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  sendEventReminder: async (eventId: string, reminderData: any) => {
    return apiRequest(`/notifications/events/${eventId}/reminder`, {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  },

  sendTicketConfirmation: async (ticketId: string, confirmationData: any) => {
    return apiRequest(`/notifications/tickets/${ticketId}/confirmation`, {
      method: 'POST',
      body: JSON.stringify(confirmationData),
    });
  },

  sendWelcomeEmail: async (userId: string, welcomeData: any) => {
    return apiRequest(`/notifications/users/${userId}/welcome`, {
      method: 'POST',
      body: JSON.stringify(welcomeData),
    });
  },

  getEmailTemplates: async () => {
    return apiRequest('/notifications/email/templates');
  },

  sendBulkEmail: async (recipients: string[], emailData: any) => {
    return apiRequest('/notifications/email/bulk', {
      method: 'POST',
      body: JSON.stringify({ recipients, ...emailData }),
    });
  },

  // Push Notification APIs
  subscribeToPushNotifications: async (subscription: PushSubscription) => {
    return apiRequest('/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    });
  },

  unsubscribeFromPushNotifications: async (subscriptionId: string) => {
    return apiRequest(`/notifications/push/unsubscribe/${subscriptionId}`, {
      method: 'DELETE',
    });
  },

  sendPushNotification: async (notificationData: any) => {
    return apiRequest('/notifications/push/send', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },

  getPushNotificationHistory: async () => {
    return apiRequest('/notifications/push/history');
  },

  updatePushPreferences: async (preferences: any) => {
    return apiRequest('/notifications/push/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  // Notification Preferences APIs
  getNotificationSettings: async () => {
    return apiRequest('/notifications/settings');
  },

  updateNotificationSettings: async (settings: any) => {
    return apiRequest('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  getNotificationChannels: async () => {
    return apiRequest('/notifications/channels');
  },

  updateChannelPreferences: async (channel: string, preferences: any) => {
    return apiRequest(`/notifications/channels/${channel}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  getNotificationSchedule: async () => {
    return apiRequest('/notifications/schedule');
  },

  updateNotificationSchedule: async (schedule: any) => {
    return apiRequest('/notifications/schedule', {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },

  testNotification: async (channel: string, testData: any) => {
    return apiRequest(`/notifications/test/${channel}`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  },
};

export const paymentsAPI = {
  createPaymentIntent: async (paymentData: any) => {
    return apiRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  confirmPayment: async (paymentIntentId: string, paymentMethod: any) => {
    return apiRequest(`/payments/${paymentIntentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(paymentMethod),
    });
  },

  getPaymentHistory: async () => {
    return apiRequest('/payments/history');
  },

  getPaymentStatus: async (paymentId: string) => {
    return apiRequest(`/payments/${paymentId}/status`);
  },

  requestRefund: async (paymentId: string, reason: string) => {
    return apiRequest(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  processPayment: async (paymentData: any) => {
    return apiRequest('/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getPaymentMethods: async () => {
    return apiRequest('/payments/methods');
  },

  savePaymentMethod: async (paymentMethodData: any) => {
    return apiRequest('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  },

  deletePaymentMethod: async (methodId: string) => {
    return apiRequest(`/payments/methods/${methodId}`, {
      method: 'DELETE',
    });
  },

  getPaymentAnalytics: async (timeRange: string = '30d') => {
    return apiRequest(`/payments/analytics?timeRange=${timeRange}`);
  },

  validatePayment: async (paymentData: any) => {
    return apiRequest('/payments/validate', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Refund Processing APIs
  getRefundRequests: async (status?: string) => {
    const url = status 
      ? `/payments/refunds?status=${status}`
      : '/payments/refunds';
    return apiRequest(url);
  },

  createRefundRequest: async (ticketId: string, refundData: any) => {
    return apiRequest(`/payments/refunds/request/${ticketId}`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  processRefund: async (refundId: string, refundData: any) => {
    return apiRequest(`/payments/refunds/${refundId}/process`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  getRefundStatus: async (refundId: string) => {
    return apiRequest(`/payments/refunds/${refundId}/status`);
  },

  cancelRefundRequest: async (refundId: string) => {
    return apiRequest(`/payments/refunds/${refundId}/cancel`, {
      method: 'DELETE',
    });
  },

  getRefundHistory: async (timeRange: string = '30d') => {
    return apiRequest(`/payments/refunds/history?timeRange=${timeRange}`);
  },
};

export const roleManagementAPI = {
  getUserRoles: async () => {
    return apiRequest('/roles/user');
  },

  getRolePermissions: async (roleId: string) => {
    return apiRequest(`/roles/${roleId}/permissions`);
  },

  assignRole: async (userId: string, roleId: string) => {
    return apiRequest('/roles/assign', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  removeRole: async (userId: string, roleId: string) => {
    return apiRequest('/roles/remove', {
      method: 'DELETE',
      body: JSON.stringify({ userId, roleId }),
    });
  },

  createRole: async (roleData: any) => {
    return apiRequest('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  },

  updateRole: async (roleId: string, roleData: any) => {
    return apiRequest(`/roles/${roleId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  },

  deleteRole: async (roleId: string) => {
    return apiRequest(`/roles/${roleId}`, {
      method: 'DELETE',
    });
  },

  checkPermission: async (permission: string, resource?: string) => {
    const url = resource 
      ? `/roles/check-permission?permission=${permission}&resource=${resource}`
      : `/roles/check-permission?permission=${permission}`;
    return apiRequest(url);
  },
};

export const mediaAPI = {
  uploadImage: async (file: File, type: 'event' | 'profile' | 'gallery') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    return apiRequest('/media/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  },

  getImageGallery: async (eventId?: string) => {
    const url = eventId ? `/media/gallery/${eventId}` : '/media/gallery';
    return apiRequest(url);
  },

  deleteImage: async (imageId: string) => {
    return apiRequest(`/media/${imageId}`, {
      method: 'DELETE',
    });
  },

  updateImageOrder: async (imageIds: string[]) => {
    return apiRequest('/media/reorder', {
      method: 'PUT',
      body: JSON.stringify({ imageIds }),
    });
  },

  // Advanced Media Management APIs
  getMediaAnalytics: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}/analytics`);
  },

  getMediaUsage: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}/usage`);
  },

  optimizeMedia: async (mediaId: string, optimizationData: any) => {
    return apiRequest(`/media/${mediaId}/optimize`, {
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  },

  getMediaVariants: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}/variants`);
  },

  createMediaVariant: async (mediaId: string, variantData: any) => {
    return apiRequest(`/media/${mediaId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variantData),
    });
  },

  getMediaMetadata: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}/metadata`);
  },

  updateMediaMetadata: async (mediaId: string, metadata: any) => {
    return apiRequest(`/media/${mediaId}/metadata`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  },

  getMediaPermissions: async (mediaId: string) => {
    return apiRequest(`/media/${mediaId}/permissions`);
  },

  updateMediaPermissions: async (mediaId: string, permissions: any) => {
    return apiRequest(`/media/${mediaId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify(permissions),
    });
  },
};

export const searchAPI = {
  searchEvents: async (query: string, filters?: any) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/search/events?${params.toString()}`);
  },

  getSearchSuggestions: async (query: string) => {
    return apiRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  getPopularSearches: async () => {
    return apiRequest('/search/popular');
  },

  getSearchHistory: async () => {
    return apiRequest('/search/history');
  },

  // Advanced Filtering APIs
  getFilterOptions: async (filterType: string) => {
    return apiRequest(`/search/filters/${filterType}`);
  },

  applyAdvancedFilters: async (filters: any) => {
    return apiRequest('/search/filters/apply', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },

  getFilterPresets: async () => {
    return apiRequest('/search/filters/presets');
  },

  saveFilterPreset: async (presetData: any) => {
    return apiRequest('/search/filters/presets', {
      method: 'POST',
      body: JSON.stringify(presetData),
    });
  },

  // Advanced Search & Discovery APIs
  getSearchRecommendations: async (userId: string, limit: number = 10) => {
    return apiRequest(`/search/recommendations/${userId}?limit=${limit}`);
  },

  getTrendingEvents: async (timeRange: string = '7d', limit: number = 10) => {
    return apiRequest(`/search/trending?timeRange=${timeRange}&limit=${limit}`);
  },

  getSimilarEvents: async (eventId: string, limit: number = 10) => {
    return apiRequest(`/search/similar/${eventId}?limit=${limit}`);
  },

  getEventRecommendations: async (userId: string, limit: number = 10) => {
    return apiRequest(`/search/events/recommendations/${userId}?limit=${limit}`);
  },

  getSearchInsights: async (query: string) => {
    return apiRequest(`/search/insights?q=${encodeURIComponent(query)}`);
  },

  getSearchTrends: async (timeRange: string = '30d') => {
    return apiRequest(`/search/trends?timeRange=${timeRange}`);
  },

  getSearchAnalytics: async (timeRange: string = '30d') => {
    return apiRequest(`/search/analytics?timeRange=${timeRange}`);
  },

  saveSearchQuery: async (query: string, filters?: any) => {
    return apiRequest('/search/save', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    });
  },
};

export const locationsAPI = {
  getAll: async () => {
    return apiRequest('/locations');
  },

  getPopular: async () => {
    return apiRequest('/locations/popular');
  },

  getByRegion: async (region: string) => {
    return apiRequest(`/locations/region/${region}`);
  },

  search: async (query: string) => {
    return apiRequest(`/locations/search?q=${encodeURIComponent(query)}`);
  },

  // Advanced Location & Venue APIs
  getVenueDetails: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}`);
  },

  getVenueEvents: async (venueId: string, timeRange: string = '30d') => {
    return apiRequest(`/locations/venues/${venueId}/events?timeRange=${timeRange}`);
  },

  getVenueCapacity: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}/capacity`);
  },

  getVenueAmenities: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}/amenities`);
  },

  getVenueAccessibility: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}/accessibility`);
  },

  getVenuePricing: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}/pricing`);
  },

  getVenueAvailability: async (venueId: string, date: string) => {
    return apiRequest(`/locations/venues/${venueId}/availability?date=${date}`);
  },

  getVenueReviews: async (venueId: string) => {
    return apiRequest(`/locations/venues/${venueId}/reviews`);
  },

  getNearbyVenues: async (latitude: number, longitude: number, radius: number = 10) => {
    return apiRequest(`/locations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  },
};

export const validationAPI = {
  validateEventData: async (eventData: any) => {
    return apiRequest('/validation/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  validateTicketData: async (ticketData: any) => {
    return apiRequest('/validation/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  validateUserData: async (userData: any) => {
    return apiRequest('/validation/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  validatePaymentData: async (paymentData: any) => {
    return apiRequest('/validation/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  getValidationRules: async (entityType: string) => {
    return apiRequest(`/validation/rules/${entityType}`);
  },

  validateFile: async (file: File, fileType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileType);
    
    return apiRequest('/validation/files', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  },

  // Enhanced Data Validation APIs
  validateBulkData: async (entityType: string, dataArray: any[]) => {
    return apiRequest(`/validation/bulk/${entityType}`, {
      method: 'POST',
      body: JSON.stringify({ data: dataArray }),
    });
  },

  getValidationSchema: async (entityType: string, version?: string) => {
    const url = version 
      ? `/validation/schema/${entityType}?version=${version}`
      : `/validation/schema/${entityType}`;
    return apiRequest(url);
  },

  validateDataConsistency: async (entityType: string, entityId: string) => {
    return apiRequest(`/validation/consistency/${entityType}/${entityId}`);
  },

  getValidationHistory: async (entityType: string, entityId: string) => {
    return apiRequest(`/validation/history/${entityType}/${entityId}`);
  },

  runDataQualityCheck: async (entityType: string, filters?: any) => {
    const params = new URLSearchParams({ entityType });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/validation/quality-check?${params.toString()}`);
  },
};

export const rateLimitAPI = {
  getRateLimitStatus: async (endpoint: string) => {
    return apiRequest(`/rate-limit/status/${endpoint}`);
  },

  getRateLimitInfo: async () => {
    return apiRequest('/rate-limit/info');
  },

  resetRateLimit: async (endpoint: string) => {
    return apiRequest(`/rate-limit/reset/${endpoint}`, {
      method: 'POST',
    });
  },

  getRateLimitHistory: async () => {
    return apiRequest('/rate-limit/history');
  },
};

export const websocketAPI = {
  getWebSocketUrl: async () => {
    return apiRequest('/websocket/url');
  },

  getWebSocketStatus: async () => {
    return apiRequest('/websocket/status');
  },

  subscribeToChannel: async (channel: string, subscriptionData: any) => {
    return apiRequest(`/websocket/subscribe/${channel}`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  },

  unsubscribeFromChannel: async (channel: string, subscriptionId: string) => {
    return apiRequest(`/websocket/unsubscribe/${channel}/${subscriptionId}`, {
      method: 'DELETE',
    });
  },

  getActiveSubscriptions: async () => {
    return apiRequest('/websocket/subscriptions');
  },

  sendWebSocketMessage: async (channel: string, message: any) => {
    return apiRequest(`/websocket/send/${channel}`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  },
};

export const liveAvailabilityAPI = {
  getEventAvailability: async (eventId: string) => {
    return apiRequest(`/live/availability/events/${eventId}`);
  },

  getTicketAvailability: async (eventId: string, tierId?: string) => {
    const url = tierId 
      ? `/live/availability/tickets/${eventId}/${tierId}`
      : `/live/availability/tickets/${eventId}`;
    return apiRequest(url);
  },

  subscribeToAvailabilityUpdates: async (eventId: string, subscriptionData: any) => {
    return apiRequest(`/live/availability/subscribe/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    });
  },

  getAvailabilityHistory: async (eventId: string, timeRange: string = '24h') => {
    return apiRequest(`/live/availability/history/${eventId}?timeRange=${timeRange}`);
  },

  getAvailabilityAlerts: async (eventId: string) => {
    return apiRequest(`/live/availability/alerts/${eventId}`);
  },

  setAvailabilityAlert: async (eventId: string, alertData: any) => {
    return apiRequest(`/live/availability/alerts/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },
};

export const liveChatAPI = {
  getChatRooms: async (eventId?: string) => {
    const url = eventId 
      ? `/chat/rooms?eventId=${eventId}`
      : '/chat/rooms';
    return apiRequest(url);
  },

  getChatHistory: async (roomId: string, limit: number = 50) => {
    return apiRequest(`/chat/rooms/${roomId}/messages?limit=${limit}`);
  },

  sendMessage: async (roomId: string, messageData: any) => {
    return apiRequest(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  joinChatRoom: async (roomId: string, userData: any) => {
    return apiRequest(`/chat/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  leaveChatRoom: async (roomId: string) => {
    return apiRequest(`/chat/rooms/${roomId}/leave`, {
      method: 'DELETE',
    });
  },

  getChatParticipants: async (roomId: string) => {
    return apiRequest(`/chat/rooms/${roomId}/participants`);
  },

  createChatRoom: async (roomData: any) => {
    return apiRequest('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  },

  updateChatRoom: async (roomId: string, roomData: any) => {
    return apiRequest(`/chat/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  },

  deleteChatRoom: async (roomId: string) => {
    return apiRequest(`/chat/rooms/${roomId}`, {
      method: 'DELETE',
    });
  },
};

export const databaseAPI = {
  // Data Synchronization APIs
  syncUserData: async (lastSyncTime: string) => {
    return apiRequest(`/database/sync/user?lastSync=${lastSyncTime}`);
  },

  syncEventData: async (eventId: string, lastSyncTime: string) => {
    return apiRequest(`/database/sync/events/${eventId}?lastSync=${lastSyncTime}`);
  },

  syncTicketData: async (lastSyncTime: string) => {
    return apiRequest(`/database/sync/tickets?lastSync=${lastSyncTime}`);
  },

  // Offline Support APIs
  getOfflineData: async () => {
    return apiRequest('/database/offline/data');
  },

  saveOfflineData: async (data: any) => {
    return apiRequest('/database/offline/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  syncOfflineChanges: async (offlineData: any) => {
    return apiRequest('/database/offline/sync', {
      method: 'POST',
      body: JSON.stringify(offlineData),
    });
  },

  // Data Integrity APIs
  validateDataIntegrity: async (entityType: string, entityId: string) => {
    return apiRequest(`/database/integrity/${entityType}/${entityId}`);
  },

  repairDataInconsistencies: async (inconsistencies: any[]) => {
    return apiRequest('/database/integrity/repair', {
      method: 'POST',
      body: JSON.stringify(inconsistencies),
    });
  },

  // Backup & Restore APIs
  createBackup: async (backupData: any) => {
    return apiRequest('/database/backup', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  },

  restoreFromBackup: async (backupId: string) => {
    return apiRequest(`/database/backup/${backupId}/restore`, {
      method: 'POST',
    });
  },

  getBackupHistory: async () => {
    return apiRequest('/database/backup/history');
  },

  // Final Data Integration APIs
  getSystemHealth: async () => {
    return apiRequest('/database/health');
  },

  getDataMetrics: async () => {
    return apiRequest('/database/metrics');
  },

  getSyncStatus: async () => {
    return apiRequest('/database/sync/status');
  },

  forceDataSync: async (entityType: string) => {
    return apiRequest(`/database/sync/force/${entityType}`, {
      method: 'POST',
    });
  },

  getDataConsistencyReport: async () => {
    return apiRequest('/database/consistency/report');
  },



  getDataVersionHistory: async (entityType: string, entityId: string) => {
    return apiRequest(`/database/versions/${entityType}/${entityId}`);
  },

  restoreDataVersion: async (entityType: string, entityId: string, versionId: string) => {
    return apiRequest(`/database/versions/${entityType}/${entityId}/restore/${versionId}`, {
      method: 'POST',
    });
  },
};

export const financialReportingAPI = {
  // Comprehensive Financial Reporting APIs
  getFinancialSummary: async (timeRange: string = '30d', filters?: any) => {
    const params = new URLSearchParams({ timeRange });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/financial/summary?${params.toString()}`);
  },

  getProfitLossStatement: async (startDate: string, endDate: string) => {
    return apiRequest(`/financial/profit-loss?startDate=${startDate}&endDate=${endDate}`);
  },

  getCashFlowStatement: async (timeRange: string = '30d') => {
    return apiRequest(`/financial/cash-flow?timeRange=${timeRange}`);
  },

  getBalanceSheet: async (asOfDate: string) => {
    return apiRequest(`/financial/balance-sheet?asOfDate=${asOfDate}`);
  },

  getTaxReport: async (year: number, quarter?: number) => {
    const url = quarter 
      ? `/financial/tax-report?year=${year}&quarter=${quarter}`
      : `/financial/tax-report?year=${year}`;
    return apiRequest(url);
  },

  getExpenseBreakdown: async (timeRange: string = '30d', category?: string) => {
    const url = category 
      ? `/financial/expenses?timeRange=${timeRange}&category=${category}`
      : `/financial/expenses?timeRange=${timeRange}`;
    return apiRequest(url);
  },

  getRevenueProjections: async (timeRange: string = '90d') => {
    return apiRequest(`/financial/projections?timeRange=${timeRange}`);
  },

  exportFinancialReport: async (reportType: string, format: string = 'pdf', filters?: any) => {
    const params = new URLSearchParams({ reportType, format });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/financial/export?${params.toString()}`);
  },
};

export default {
  auth: authAPI,
  events: eventsAPI,
  tickets: ticketsAPI,
  users: usersAPI,
};
