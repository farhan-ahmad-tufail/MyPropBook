import { supabase, supabaseDb, isSupabaseConfigured } from './supabase';
import { mockDb } from './mockDb';

// Check if we are running in local mock mode or real Supabase mode
export const isLocalMode = () => {
  return !isSupabaseConfigured();
};

export const api = {
  // Authentication
  auth: {
    signUp: async (email, password, fullName, phone = '') => {
      if (!isLocalMode()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            },
          },
        });
        if (error) throw error;
        return data;
      } else {
        return mockDb.auth.signUp(email, password, fullName, phone);
      }
    },

    signIn: async (email, password) => {
      if (!isLocalMode()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data;
      } else {
        return mockDb.auth.signIn(email, password);
      }
    },

    signOut: async () => {
      if (!isLocalMode()) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } else {
        return mockDb.auth.signOut();
      }
    },

    getCurrentUser: async () => {
      if (!isLocalMode()) {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
      } else {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const activeToken = localStorage.getItem('mock_token');
        if (activeToken && users.length > 0) {
          // Return the first mock user as logged in for ease of local demo
          return users[0] || { id: 'mock_owner_id', email: 'owner@example.com', fullName: 'Demo Property Owner' };
        }
        return null;
      }
    }
  },

  // Properties
  getProperties: async (userId) => {
    if (!isLocalMode()) {
      return supabaseDb.getProperties(userId);
    } else {
      return mockDb.getProperties(userId || 'mock_owner_id');
    }
  },
  createProperty: async (userId, data) => {
    if (!isLocalMode()) {
      return supabaseDb.createProperty(userId, data);
    } else {
      return mockDb.createProperty(userId || 'mock_owner_id', data);
    }
  },
  updateProperty: async (id, data) => {
    if (!isLocalMode()) {
      return supabaseDb.updateProperty(id, data);
    } else {
      return mockDb.updateProperty(id, data);
    }
  },
  deleteProperty: async (id) => {
    if (!isLocalMode()) {
      return supabaseDb.deleteProperty(id);
    } else {
      return mockDb.deleteProperty(id);
    }
  },

  // Rooms
  getRooms: async (propertyId) => {
    if (!isLocalMode()) {
      return supabaseDb.getRooms(propertyId);
    } else {
      return mockDb.getRooms(propertyId);
    }
  },
  getAllRooms: async (userId) => {
    if (!isLocalMode()) {
      return supabaseDb.getAllRooms(userId);
    } else {
      return mockDb.getAllRooms(userId || 'mock_owner_id');
    }
  },
  createRoom: async (propertyId, data) => {
    if (!isLocalMode()) {
      return supabaseDb.createRoom(propertyId, data);
    } else {
      return mockDb.createRoom(propertyId, data);
    }
  },
  updateRoom: async (id, data) => {
    if (!isLocalMode()) {
      return supabaseDb.updateRoom(id, data);
    } else {
      return mockDb.updateRoom(id, data);
    }
  },
  deleteRoom: async (id) => {
    if (!isLocalMode()) {
      return supabaseDb.deleteRoom(id);
    } else {
      return mockDb.deleteRoom(id);
    }
  },

  // Room Types
  getRoomTypes: async (propertyId) => {
    if (!isLocalMode()) {
      return (supabaseDb.getRoomTypes ? supabaseDb.getRoomTypes(propertyId) : mockDb.getRoomTypes(propertyId));
    } else {
      return mockDb.getRoomTypes(propertyId);
    }
  },
  createRoomType: async (propertyId, data) => {
    if (!isLocalMode()) {
      return (supabaseDb.createRoomType ? supabaseDb.createRoomType(propertyId, data) : mockDb.createRoomType(propertyId, data));
    } else {
      return mockDb.createRoomType(propertyId, data);
    }
  },

  // Tenants
  getTenants: async (userId) => {
    if (!isLocalMode()) {
      return supabaseDb.getTenants(userId);
    } else {
      return mockDb.getTenants(userId || 'mock_owner_id');
    }
  },
  createTenant: async (userId, data) => {
    if (!isLocalMode()) {
      return supabaseDb.createTenant(userId, data);
    } else {
      return mockDb.createTenant(userId || 'mock_owner_id', data);
    }
  },
  updateTenant: async (id, data) => {
    if (!isLocalMode()) {
      return supabaseDb.updateTenant(id, data);
    } else {
      return mockDb.updateTenant(id, data);
    }
  },
  deleteTenant: async (id) => {
    if (!isLocalMode()) {
      return supabaseDb.deleteTenant(id);
    } else {
      return mockDb.deleteTenant(id);
    }
  },

  // Leases
  getLeases: async (userId) => {
    if (!isLocalMode()) {
      return supabaseDb.getLeases(userId);
    } else {
      return mockDb.getLeases(userId || 'mock_owner_id');
    }
  },
  createLease: async (tenantId, roomId, data) => {
    if (!isLocalMode()) {
      return supabaseDb.createLease(tenantId, roomId, data);
    } else {
      return mockDb.createLease(tenantId, roomId, data);
    }
  },
  deactivateLease: async (leaseId) => {
    if (!isLocalMode()) {
      return supabaseDb.deactivateLease(leaseId);
    } else {
      return mockDb.deactivateLease(leaseId);
    }
  },

  // Bills
  getBills: async (userId) => {
    if (!isLocalMode()) {
      return supabaseDb.getBills(userId);
    } else {
      return mockDb.getBills(userId || 'mock_owner_id');
    }
  },
  createBill: async (data) => {
    if (!isLocalMode()) {
      return supabaseDb.createBill(data);
    } else {
      return mockDb.createBill(data);
    }
  },
  updateBillStatus: async (billId, status) => {
    if (!isLocalMode()) {
      return supabaseDb.updateBillStatus(billId, status);
    } else {
      return mockDb.updateBillStatus(billId, status);
    }
  },

  // Payments
  getPayments: async (billId) => {
    if (!isLocalMode()) {
      return supabaseDb.getPayments(billId);
    } else {
      return mockDb.getPayments(billId);
    }
  },
  recordPayment: async (billId, amount, method) => {
    if (!isLocalMode()) {
      return supabaseDb.recordPayment(billId, amount, method);
    } else {
      return mockDb.recordPayment(billId, amount, method);
    }
  }
};
