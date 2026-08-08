import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
  return !!supabase;
};

// Database operations mapping to Supabase
export const supabaseDb = {
  // Properties
  getProperties: async (userId) => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },
  createProperty: async (userId, propData) => {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ owner_id: userId, ...propData }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateProperty: async (id, propData) => {
    const { data, error } = await supabase
      .from('properties')
      .update(propData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteProperty: async (id) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Rooms
  getRooms: async (propertyId) => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .order('room_number', { ascending: true });
    if (error) throw error;
    return data;
  },
  getAllRooms: async (userId) => {
    // Select all rooms belonging to properties owned by user
    const { data, error } = await supabase
      .from('rooms')
      .select('*, properties!inner(owner_id)')
      .eq('properties.owner_id', userId);
    if (error) throw error;
    return data;
  },
  createRoom: async (propertyId, roomData) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert([{
        property_id: propertyId,
        room_number: roomData.room_number,
        floor: roomData.floor,
        room_type: roomData.room_type,
        base_rent: parseFloat(roomData.base_rent),
        has_submeter: roomData.has_submeter !== false,
        elec_mode: roomData.elec_mode || (roomData.has_submeter !== false ? 'submeter' : 'direct'),
        current_meter_reading: parseFloat(roomData.current_meter_reading || 0),
        rate_per_unit: parseFloat(roomData.rate_per_unit || 17)
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateRoom: async (id, roomData) => {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        room_number: roomData.room_number,
        floor: roomData.floor,
        room_type: roomData.room_type,
        base_rent: parseFloat(roomData.base_rent),
        has_submeter: roomData.has_submeter !== false,
        elec_mode: roomData.elec_mode,
        current_meter_reading: parseFloat(roomData.current_meter_reading),
        rate_per_unit: parseFloat(roomData.rate_per_unit)
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteRoom: async (id) => {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Tenants
  getTenants: async (userId) => {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', userId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },
  createTenant: async (userId, tenantData) => {
    const { data, error } = await supabase
      .from('tenants')
      .insert([{ owner_id: userId, ...tenantData }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateTenant: async (id, tenantData) => {
    const { data, error } = await supabase
      .from('tenants')
      .update(tenantData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deleteTenant: async (id) => {
    const { error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Leases
  getLeases: async (userId) => {
    const { data, error } = await supabase
      .from('leases')
      .select('*, tenants!inner(owner_id)')
      .eq('tenants.owner_id', userId);
    if (error) throw error;
    return data;
  },
  createLease: async (tenantId, roomId, leaseData = {}) => {
    // Deactivate previous active leases for this room
    await supabase
      .from('leases')
      .update({ is_active: false })
      .eq('room_id', roomId);

    const { data, error } = await supabase
      .from('leases')
      .insert([{
        tenant_id: tenantId,
        room_id: roomId,
        start_date: leaseData.start_date || new Date().toISOString().split('T')[0],
        end_date: leaseData.end_date || null,
        is_active: true
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  deactivateLease: async (leaseId) => {
    const { data, error } = await supabase
      .from('leases')
      .update({ is_active: false })
      .eq('id', leaseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Bills
  getBills: async (userId) => {
    // Select bills where the room belongs to a property owned by userId
    const { data, error } = await supabase
      .from('bills')
      .select('*, rooms!inner(id, properties!inner(owner_id))')
      .eq('rooms.properties.owner_id', userId)
      .order('generated_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  createBill: async (billData) => {
    // Insert new bill
    const { data: bill, error: billErr } = await supabase
      .from('bills')
      .insert([{
        room_id: billData.room_id,
        tenant_id: billData.tenant_id,
        bill_month: billData.bill_month,
        bill_year: parseInt(billData.bill_year),
        previous_reading: parseFloat(billData.previous_reading),
        current_reading: parseFloat(billData.current_reading),
        units_consumed: parseFloat(billData.units_consumed),
        rate_per_unit: parseFloat(billData.rate_per_unit),
        rent_amount: parseFloat(billData.rent_amount),
        arrears: parseFloat(billData.arrears || 0),
        other_charges: parseFloat(billData.other_charges || 0),
        total_payable: parseFloat(billData.total_payable),
        amount_paid: 0,
        payment_status: billData.payment_status || 'Unpaid'
      }])
      .select()
      .single();

    if (billErr) throw billErr;

    // Update Room's current reading
    const { error: roomErr } = await supabase
      .from('rooms')
      .update({ current_meter_reading: parseFloat(billData.current_reading) })
      .eq('id', billData.room_id);

    if (roomErr) throw roomErr;

    return bill;
  },
  updateBillStatus: async (billId, status) => {
    const { data, error } = await supabase
      .from('bills')
      .update({ payment_status: status })
      .eq('id', billId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Payments
  getPayments: async (billId) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('bill_id', billId)
      .order('payment_date', { ascending: true });
    if (error) throw error;
    return data;
  },
  recordPayment: async (billId, amount, method) => {
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert([{
        bill_id: billId,
        amount_paid: parseFloat(amount),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: method
      }])
      .select()
      .single();

    if (payErr) throw payErr;

    // Calculate sum of payments for the bill to update its status
    const { data: allPayments, error: listErr } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('bill_id', billId);

    if (listErr) throw listErr;

    const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

    // Get total payable from bill
    const { data: bill, error: billErr } = await supabase
      .from('bills')
      .select('total_payable')
      .eq('id', billId)
      .single();

    if (billErr) throw billErr;

    let status = 'Unpaid';
    if (totalPaid >= parseFloat(bill.total_payable)) {
      status = 'Paid';
    } else if (totalPaid > 0) {
      status = 'Partially Paid';
    }

    await supabase
      .from('bills')
      .update({ payment_status: status, amount_paid: totalPaid })
      .eq('id', billId);

    return payment;
  }
};
