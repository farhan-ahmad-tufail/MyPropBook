// Mock Database implementation using localStorage
// This allows the app to run in "Local Demo Mode" if Supabase is not configured yet.

const getStore = (key, defaultVal = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setStore = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const mockDb = {
  // Authentication Mock
  auth: {
    signUp: async (email, password, fullName) => {
      const users = getStore('mock_users');
      if (users.find(u => u.email === email)) {
        throw new Error('User already exists');
      }
      const newUser = { id: 'user_' + Date.now(), email, fullName };
      users.push(newUser);
      setStore('mock_users', users);
      return { user: newUser, session: { access_token: 'mock_token' } };
    },
    signIn: async (email, password) => {
      const users = getStore('mock_users');
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      return { user, session: { access_token: 'mock_token' } };
    },
    signOut: async () => {
      return null;
    }
  },

  // Properties
  getProperties: async (userId) => {
    const list = getStore('mock_properties');
    return list.filter(p => p.owner_id === userId);
  },
  createProperty: async (userId, data) => {
    const list = getStore('mock_properties');
    const newProp = {
      id: 'prop_' + Date.now(),
      owner_id: userId,
      name: data.name,
      address: data.address,
      created_at: new Date().toISOString()
    };
    list.push(newProp);
    setStore('mock_properties', list);
    return newProp;
  },
  updateProperty: async (id, data) => {
    const list = getStore('mock_properties');
    const index = list.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Property not found');
    list[index] = { ...list[index], ...data };
    setStore('mock_properties', list);
    return list[index];
  },
  deleteProperty: async (id) => {
    const list = getStore('mock_properties');
    const updated = list.filter(p => p.id !== id);
    setStore('mock_properties', updated);

    // Cascade delete rooms
    const rooms = getStore('mock_rooms');
    const updatedRooms = rooms.filter(r => r.property_id !== id);
    setStore('mock_rooms', updatedRooms);
  },

  // Rooms
  getRooms: async (propertyId) => {
    const list = getStore('mock_rooms');
    return list.filter(r => r.property_id === propertyId);
  },
  getAllRooms: async (userId) => {
    const properties = await mockDb.getProperties(userId);
    const propIds = properties.map(p => p.id);
    const rooms = getStore('mock_rooms');
    return rooms.filter(r => propIds.includes(r.property_id));
  },
  createRoom: async (propertyId, data) => {
    const list = getStore('mock_rooms');
    const newRoom = {
      id: 'room_' + Date.now(),
      property_id: propertyId,
      room_number: data.room_number,
      floor: data.floor,
      room_type: data.room_type || 'Medium',
      base_rent: parseFloat(data.base_rent) || 0,
      current_meter_reading: parseFloat(data.current_meter_reading) || 0,
      rate_per_unit: parseFloat(data.rate_per_unit) || 17,
      created_at: new Date().toISOString()
    };
    list.push(newRoom);
    setStore('mock_rooms', list);
    return newRoom;
  },
  updateRoom: async (id, data) => {
    const list = getStore('mock_rooms');
    const index = list.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');
    list[index] = {
      ...list[index],
      ...data,
      base_rent: data.base_rent !== undefined ? parseFloat(data.base_rent) : list[index].base_rent,
      current_meter_reading: data.current_meter_reading !== undefined ? parseFloat(data.current_meter_reading) : list[index].current_meter_reading,
      rate_per_unit: data.rate_per_unit !== undefined ? parseFloat(data.rate_per_unit) : list[index].rate_per_unit,
    };
    setStore('mock_rooms', list);
    return list[index];
  },
  deleteRoom: async (id) => {
    const list = getStore('mock_rooms');
    const updated = list.filter(r => r.id !== id);
    setStore('mock_rooms', updated);

    // Clean up leases associated with this room
    const leases = getStore('mock_leases');
    const updatedLeases = leases.filter(l => l.room_id !== id);
    setStore('mock_leases', updatedLeases);
  },

  // Tenants
  getTenants: async (userId) => {
    const list = getStore('mock_tenants');
    return list.filter(t => t.owner_id === userId);
  },
  createTenant: async (userId, data) => {
    const list = getStore('mock_tenants');
    const newTenant = {
      id: 'tenant_' + Date.now(),
      owner_id: userId,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      active: data.active !== undefined ? data.active : true,
      created_at: new Date().toISOString()
    };
    list.push(newTenant);
    setStore('mock_tenants', list);
    return newTenant;
  },
  updateTenant: async (id, data) => {
    const list = getStore('mock_tenants');
    const index = list.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');
    list[index] = { ...list[index], ...data };
    setStore('mock_tenants', list);
    return list[index];
  },
  deleteTenant: async (id) => {
    const list = getStore('mock_tenants');
    const updated = list.filter(t => t.id !== id);
    setStore('mock_tenants', updated);

    // Clean up leases associated with this tenant
    const leases = getStore('mock_leases');
    const updatedLeases = leases.filter(l => l.tenant_id !== id);
    setStore('mock_leases', updatedLeases);
  },

  // Leases (Linking Tenants to Rooms)
  getLeases: async (userId) => {
    const tenants = await mockDb.getTenants(userId);
    const tenantIds = tenants.map(t => t.id);
    const leases = getStore('mock_leases');
    return leases.filter(l => tenantIds.includes(l.tenant_id));
  },
  createLease: async (tenantId, roomId, data = {}) => {
    const list = getStore('mock_leases');
    
    // Deactivate existing active leases for this room
    const updated = list.map(l => l.room_id === roomId ? { ...l, is_active: false } : l);

    const newLease = {
      id: 'lease_' + Date.now(),
      tenant_id: tenantId,
      room_id: roomId,
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || null,
      is_active: true,
      created_at: new Date().toISOString()
    };
    updated.push(newLease);
    setStore('mock_leases', updated);
    return newLease;
  },
  deactivateLease: async (leaseId) => {
    const list = getStore('mock_leases');
    const index = list.findIndex(l => l.id === leaseId);
    if (index !== -1) {
      list[index].is_active = false;
      setStore('mock_leases', list);
    }
  },

  // Bills
  getBills: async (userId) => {
    const rooms = await mockDb.getAllRooms(userId);
    const roomIds = rooms.map(r => r.id);
    const bills = getStore('mock_bills');
    return bills.filter(b => roomIds.includes(b.room_id));
  },
  createBill: async (data) => {
    const list = getStore('mock_bills');
    const newBill = {
      id: 'bill_' + Date.now(),
      room_id: data.room_id,
      tenant_id: data.tenant_id,
      bill_month: data.bill_month,
      bill_year: parseInt(data.bill_year),
      previous_reading: parseFloat(data.previous_reading),
      current_reading: parseFloat(data.current_reading),
      units_consumed: parseFloat(data.units_consumed),
      rate_per_unit: parseFloat(data.rate_per_unit),
      rent_amount: parseFloat(data.rent_amount),
      arrears: parseFloat(data.arrears || 0),
      other_charges: parseFloat(data.other_charges || 0),
      total_payable: parseFloat(data.total_payable),
      payment_status: data.payment_status || 'Unpaid',
      generated_at: new Date().toISOString()
    };
    list.push(newBill);
    setStore('mock_bills', list);

    // Update Room's current_meter_reading
    const rooms = getStore('mock_rooms');
    const roomIndex = rooms.findIndex(r => r.id === data.room_id);
    if (roomIndex !== -1) {
      rooms[roomIndex].current_meter_reading = parseFloat(data.current_reading);
      setStore('mock_rooms', rooms);
    }

    return newBill;
  },
  updateBillStatus: async (billId, status) => {
    const list = getStore('mock_bills');
    const index = list.findIndex(b => b.id === billId);
    if (index === -1) throw new Error('Bill not found');
    list[index].payment_status = status;
    setStore('mock_bills', list);
    return list[index];
  },

  // Payments
  getPayments: async (billId) => {
    const list = getStore('mock_payments');
    return list.filter(p => p.bill_id === billId);
  },
  recordPayment: async (billId, amount, method) => {
    const payments = getStore('mock_payments');
    const newPayment = {
      id: 'pay_' + Date.now(),
      bill_id: billId,
      amount_paid: parseFloat(amount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: method
    };
    payments.push(newPayment);
    setStore('mock_payments', payments);

    // Update Bill Payment Status
    const bills = getStore('mock_bills');
    const billIdx = bills.findIndex(b => b.id === billId);
    if (billIdx !== -1) {
      const bill = bills[billIdx];
      const billPayments = payments.filter(p => p.bill_id === billId);
      const totalPaid = billPayments.reduce((sum, p) => sum + p.amount_paid, 0);

      if (totalPaid >= bill.total_payable) {
        bill.payment_status = 'Paid';
      } else if (totalPaid > 0) {
        bill.payment_status = 'Partially Paid';
      } else {
        bill.payment_status = 'Unpaid';
      }
      setStore('mock_bills', bills);
    }
    return newPayment;
  }
};
