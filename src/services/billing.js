import { api } from './api';

/**
 * Generate bulk bills for a set of occupied rooms.
 *
 * @param {string} propertyId - The ID of the property (currently not used but kept for future extensions).
 * @param {Array} occupiedRooms - Array of room objects that are currently occupied.
 * @param {Object} bulkReadings - Map of roomId -> { currentReading, otherCharges } supplied by the user.
 * @param {string} month - Billing month name (e.g., "January").
 * @param {string|number} year - Billing year (e.g., 2024).
 * @returns {Promise<Array>} - Array of results for each room indicating success or failure.
 */
export async function generateBulkBills(propertyId, occupiedRooms, bulkReadings, month, year, ownerId = 'mock_owner_id') {
  const results = [];

  // Helper to find tenant id for a room based on active lease.
  const getTenantIdForRoom = async (roomId) => {
    try {
      const allLeases = await (api.getLeases ? api.getLeases(ownerId) : []);
      const lease = allLeases.find(l => l.room_id === roomId && l.is_active);
      return lease ? lease.tenant_id : null;
    } catch (_) {
      return null;
    }
  };

  for (const room of occupiedRooms) {
    try {
      const readings = bulkReadings[room.id] || {};
      const prevReading = parseFloat(room.current_meter_reading || 0);
      const rawCurr = readings.currentReading;
      const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
        ? parseFloat(rawCurr)
        : prevReading;
      const units = Math.max(0, currReading - prevReading);

      // Electricity calculation based on mode.
      let elec = 0;
      const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);

      if (room.elec_mode === 'submeter') {
        elec = units * rate;
      } else if (room.elec_mode === 'direct') {
        elec = parseFloat(room.direct_elec_amount || 0);
      } else if (room.elec_mode === 'fixed') {
        elec = parseFloat(room.fixed_elec_amount || 0);
      }

      const rent = parseFloat(room.base_rent || 0) || 0;
      const otherRaw = readings.otherCharges;
      const other = (otherRaw !== '' && otherRaw !== null && otherRaw !== undefined && !isNaN(otherRaw))
        ? parseFloat(otherRaw)
        : 0;
      const total = rent + elec + other;

      const tenantId = await getTenantIdForRoom(room.id);

      const billPayload = {
        room_id: room.id,
        tenant_id: tenantId,
        bill_month: month,
        bill_year: Number(year),
        previous_reading: prevReading,
        current_reading: currReading,
        units_consumed: units,
        rate_per_unit: rate,
        rent_amount: rent,
        arrears: 0,
        other_charges: other,
        total_payable: total,
        payment_status: total === 0 ? 'Paid' : 'Unpaid',
      };

      const createdBill = await api.createBill(billPayload);
      results.push({
        success: true,
        room: room,
        billId: createdBill.id,
        createdBill: createdBill,
        tenantId: tenantId,
        totalPayable: total,
        message: 'Bill generated'
      });
    } catch (err) {
      results.push({ success: false, room: room, error: err.message || String(err) });
    }
  }

  return results;
}
