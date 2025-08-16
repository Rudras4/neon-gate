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
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/me');
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
};

export default {
  auth: authAPI,
  events: eventsAPI,
  tickets: ticketsAPI,
  users: usersAPI,
};
