import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-72f8f261`;

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = publicAnonKey;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('access_token') || publicAnonKey;
    }
  } catch (e) {
    console.warn('localStorage access failed, using public key:', e);
  }
  
  console.log(`🔵 API Call: ${endpoint}`, {
    method: options.method || 'GET',
    hasToken: !!token,
    tokenType: token === publicAnonKey ? 'public' : 'user'
  });
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ API Error [${response.status}]:`, {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      error: data.error,
      fullResponse: data
    });
    throw new Error(data.error || `API request failed (${response.status}): ${response.statusText}`);
  }

  console.log(`✅ API Success: ${endpoint}`, data);
  return data;
}

export const api = {
  // Auth
  signup: async (email: string, password: string, name: string) => {
    return apiCall('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
  },

  // Groups
  createGroup: async (groupData: any) => {
    return apiCall('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },

  getGroups: async () => {
    return apiCall('/groups');
  },

  getGroup: async (groupId: string) => {
    const result = await apiCall(`/groups/${groupId}`);
    console.log(`🔍 API getGroup(${groupId}):`, {
      currentMembers: result.group?.currentMembers,
      numberOfPeople: result.group?.numberOfPeople,
      status: result.group?.status,
      membersCount: result.group?.members?.length
    });
    return result;
  },

  joinGroup: async (groupId: string, data: { numberOfTickets: number; ticketHolders: any[] }) => {
    return apiCall(`/groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Bookings
  createBooking: async (bookingData: any) => {
    return apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  getUserBookings: async () => {
    return apiCall('/user/bookings');
  },

  getUserGroups: async () => {
    return apiCall('/user/groups');
  },

  getAllUserGroups: async () => {
    return apiCall('/user/groups/all');
  },

  // Tickets
  getGroupTickets: async (groupId: string) => {
    return apiCall(`/tickets/${groupId}`);
  },

  getUserTickets: async () => {
    return apiCall('/user/tickets');
  },

  // Admin/Staff endpoints
  getAllFullGroups: async () => {
    return apiCall('/admin/groups/full');
  },

  sendGroupTickets: async (groupId: string) => {
    return apiCall(`/admin/groups/${groupId}/send-tickets`, {
      method: 'POST',
    });
  },

  deleteAllGroups: async () => {
    return apiCall('/admin/groups/all', {
      method: 'DELETE',
    });
  },
};
