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
  let allLeases = [];
  try {
    allLeases = await (api.getLeases ? api.getLeases(ownerId) : []);
  } catch (_) {
    allLeases = [];
  }

  const getTenantIdForRoom = (roomId) => {
    const lease = allLeases.find(l => l.room_id === roomId && l.is_active);
    return lease ? lease.tenant_id : null;
  };

  // Group rooms by tenantId (if unassigned or standalone, keep solo key)
  const tenantGroups = new Map();

  for (const room of occupiedRooms) {
    const tenantId = getTenantIdForRoom(room.id);
    const key = tenantId ? `tenant_${tenantId}` : `room_${room.id}`;
    if (!tenantGroups.has(key)) {
      tenantGroups.set(key, { tenantId, rooms: [] });
    }
    tenantGroups.get(key).rooms.push(room);
  }

  for (const [, group] of tenantGroups) {
    const { tenantId, rooms: groupRooms } = group;

    // Single room bill (standard path)
    if (groupRooms.length === 1) {
      const room = groupRooms[0];
      try {
        const readings = bulkReadings[room.id] || {};
        const prevReading = parseFloat(room.current_meter_reading || 0);
        const rawCurr = readings.currentReading;
        const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
          ? parseFloat(rawCurr)
          : prevReading;
        const units = Math.max(0, currReading - prevReading);

        let elec = 0;
        const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);

        if (room.elec_mode === 'submeter') {
          elec = units * rate;
        } else {
          const customDirect = readings.directElec;
          if (customDirect !== undefined && customDirect !== '' && customDirect !== null && !isNaN(customDirect)) {
            elec = parseFloat(customDirect);
          } else if (room.elec_mode === 'direct') {
            elec = parseFloat(room.direct_elec_amount || 0);
          } else if (room.elec_mode === 'fixed') {
            elec = parseFloat(room.fixed_elec_amount || 0);
          }
        }

        const rent = parseFloat(room.base_rent || 0) || 0;
        const otherRaw = readings.otherCharges;
        const other = (otherRaw !== '' && otherRaw !== null && otherRaw !== undefined && !isNaN(otherRaw))
          ? parseFloat(otherRaw)
          : 0;

        let roomArrears = 0;
        if (tenantId) {
          try {
            const allBills = await (api.getBills ? api.getBills(ownerId) : []);
            roomArrears = allBills
              .filter(b => b.room_id === room.id && b.tenant_id === tenantId && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
              .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
          } catch (_) {}
        }

        const customArrearsRaw = readings.arrears;
        const arrears = (customArrearsRaw !== '' && customArrearsRaw !== null && customArrearsRaw !== undefined && !isNaN(customArrearsRaw))
          ? parseFloat(customArrearsRaw)
          : roomArrears;

        const total = rent + elec + arrears + other;

        const billPayload = {
          room_id: room.id,
          tenant_id: tenantId,
          bill_month: month,
          bill_year: Number(year),
          previous_reading: prevReading,
          current_reading: currReading,
          units_consumed: units,
          rate_per_unit: rate,
          elec_amount: elec,
          electricity_amount: elec,
          rent_amount: rent,
          arrears: arrears,
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
    } else {
      // Multi-room combined bill for 1 tenant
      try {
        const roomItems = [];
        let combinedRent = 0;
        let combinedElec = 0;
        let combinedOther = 0;

        for (const room of groupRooms) {
          const readings = bulkReadings[room.id] || {};
          const prevReading = parseFloat(room.current_meter_reading || 0);
          const rawCurr = readings.currentReading;
          const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
            ? parseFloat(rawCurr)
            : prevReading;
          const units = Math.max(0, currReading - prevReading);

          let elec = 0;
          const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);

          if (room.elec_mode === 'submeter') {
            elec = units * rate;
          } else {
            const customDirect = readings.directElec;
            if (customDirect !== undefined && customDirect !== '' && customDirect !== null && !isNaN(customDirect)) {
              elec = parseFloat(customDirect);
            } else if (room.elec_mode === 'direct') {
              elec = parseFloat(room.direct_elec_amount || 0);
            } else if (room.elec_mode === 'fixed') {
              elec = parseFloat(room.fixed_elec_amount || 0);
            }
          }

          const rent = parseFloat(room.base_rent || 0) || 0;
          const otherRaw = readings.otherCharges;
          const other = (otherRaw !== '' && otherRaw !== null && otherRaw !== undefined && !isNaN(otherRaw))
            ? parseFloat(otherRaw)
            : 0;

          combinedRent += rent;
          combinedElec += elec;
          combinedOther += other;

          roomItems.push({
            room_id: room.id,
            room_number: room.room_number,
            room_type: room.room_type || 'Single Room',
            previous_reading: prevReading,
            current_reading: currReading,
            units_consumed: units,
            rate_per_unit: rate,
            rent_amount: rent,
            elec_amount: elec,
            electricity_amount: elec,
            other_charges: other
          });
        }

        // Arrears for multi-room tenant
        let combinedArrears = 0;
        if (tenantId) {
          try {
            const allBills = await (api.getBills ? api.getBills(ownerId) : []);
            combinedArrears = allBills
              .filter(b => b.tenant_id === tenantId && (b.payment_status === 'Unpaid' || b.payment_status === 'Partially Paid'))
              .reduce((sum, b) => sum + (parseFloat(b.total_payable || 0) - parseFloat(b.amount_paid || 0)), 0);
          } catch (_) {}
        }

        const total = combinedRent + combinedElec + combinedArrears + combinedOther;

        const billPayload = {
          room_id: groupRooms[0].id,
          tenant_id: tenantId,
          bill_month: month,
          bill_year: Number(year),
          previous_reading: 0,
          current_reading: 0,
          units_consumed: 0,
          rate_per_unit: 0,
          elec_amount: combinedElec,
          electricity_amount: combinedElec,
          rent_amount: combinedRent,
          arrears: combinedArrears,
          other_charges: combinedOther,
          total_payable: total,
          payment_status: total === 0 ? 'Paid' : 'Unpaid',
          room_items: roomItems
        };

        const createdBill = await api.createBill(billPayload);
        for (const room of groupRooms) {
          results.push({
            success: true,
            room: room,
            billId: createdBill.id,
            createdBill: createdBill,
            tenantId: tenantId,
            totalPayable: total,
            message: `Combined bill generated (${groupRooms.length} rooms)`
          });
        }
      } catch (err) {
        for (const room of groupRooms) {
          results.push({ success: false, room: room, error: err.message || String(err) });
        }
      }
    }
  }

  return results;
}

