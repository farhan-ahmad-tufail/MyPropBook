import { api } from './api';
import { getPreviousBillDue } from '../utils/formatters';

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

  let allLeases = [];
  let allTenants = [];
  let allBills = [];
  try {
    const [lList, tList, bList] = await Promise.all([
      api.getLeases ? api.getLeases(ownerId) : [],
      api.getTenants ? api.getTenants(ownerId) : [],
      api.getBills ? api.getBills(ownerId) : []
    ]);
    allLeases = lList || [];
    allTenants = tList || [];
    allBills = bList || [];
  } catch (_) {}

  const getTenantsForRoom = (roomId) => {
    const activeLeases = allLeases.filter(l => l.room_id === roomId && l.is_active);
    return activeLeases.map(l => allTenants.find(t => t.id === l.tenant_id)).filter(Boolean);
  };

  // Group rooms to check for multi-room single tenant vs multi-tenant rooms
  for (const room of occupiedRooms) {
    const roomTenants = getTenantsForRoom(room.id);
    const tenantCount = Math.max(1, roomTenants.length);
    const isShared = tenantCount > 1;

    try {
      const roomReadings = bulkReadings[room.id] || {};
      const prevReading = parseFloat(room.current_meter_reading || 0);
      const rawCurr = roomReadings.currentReading;
      const currReading = (rawCurr !== '' && rawCurr !== null && rawCurr !== undefined && !isNaN(rawCurr))
        ? parseFloat(rawCurr)
        : prevReading;
      const totalRoomUnits = Math.max(0, currReading - prevReading);
      const rate = parseFloat(room.rate_per_unit ?? room.elec_rate ?? 17);
      const isSubmeter = room.elec_mode === 'submeter' || (!room.elec_mode && room.has_submeter !== false) || isShared;

      let totalRoomElec = 0;
      if (isSubmeter) {
        totalRoomElec = totalRoomUnits * rate;
      } else {
        const customDirect = roomReadings.directElec;
        if (customDirect !== undefined && customDirect !== '' && customDirect !== null && !isNaN(customDirect)) {
          totalRoomElec = parseFloat(customDirect);
        } else if (room.elec_mode === 'direct') {
          totalRoomElec = parseFloat(room.direct_elec_amount || 0);
        } else if (room.elec_mode === 'fixed') {
          totalRoomElec = parseFloat(room.fixed_elec_amount || 0);
        }
      }

      const tenantElecShare = isShared ? Math.round(totalRoomElec / tenantCount) : totalRoomElec;
      const rent = parseFloat(room.base_rent || 0) || 0;

      if (roomTenants.length === 0) {
        // Fallback: room without active tenant
        const otherRaw = roomReadings.otherCharges;
        const other = (otherRaw !== '' && otherRaw !== null && otherRaw !== undefined && !isNaN(otherRaw)) ? parseFloat(otherRaw) : 0;
        const total = rent + totalRoomElec + other;
        const billPayload = {
          room_id: room.id,
          tenant_id: null,
          bill_month: month,
          bill_year: Number(year),
          previous_reading: prevReading,
          current_reading: currReading,
          units_consumed: totalRoomUnits,
          rate_per_unit: rate,
          elec_amount: totalRoomElec,
          electricity_amount: totalRoomElec,
          rent_amount: rent,
          arrears: 0,
          other_charges: other,
          total_payable: total,
          payment_status: total === 0 ? 'Paid' : 'Unpaid',
        };
        const createdBill = await api.createBill(billPayload);
        results.push({
          success: true,
          room,
          tenant: null,
          billId: createdBill.id,
          createdBill,
          tenantId: null,
          totalPayable: total,
          message: 'Bill generated'
        });
      } else {
        // Generate separate bill for EACH tenant in this room
        for (const tenant of roomTenants) {
          const tenantKey = `${room.id}__${tenant.id}`;
          const tenantSpecificReadings = bulkReadings[tenantKey] || {};

          // Auto arrears: only the unpaid due from the most recent previous bill (prevents stacking earlier months)
          const autoArrears = getPreviousBillDue(allBills, room.id, tenant.id, month, year);

          const customArrearsRaw = tenantSpecificReadings.arrears !== undefined ? tenantSpecificReadings.arrears : roomReadings.arrears;
          const arrears = (customArrearsRaw !== '' && customArrearsRaw !== null && customArrearsRaw !== undefined && !isNaN(customArrearsRaw))
            ? parseFloat(customArrearsRaw)
            : autoArrears;

          const otherRaw = tenantSpecificReadings.otherCharges !== undefined ? tenantSpecificReadings.otherCharges : roomReadings.otherCharges;
          const other = (otherRaw !== '' && otherRaw !== null && otherRaw !== undefined && !isNaN(otherRaw))
            ? parseFloat(otherRaw)
            : 0;

          const total = rent + tenantElecShare + arrears + other;

          const billPayload = {
            room_id: room.id,
            tenant_id: tenant.id,
            bill_month: month,
            bill_year: Number(year),
            previous_reading: prevReading,
            current_reading: currReading,
            units_consumed: totalRoomUnits,
            rate_per_unit: rate,
            room_total_elec: totalRoomElec,
            split_count: tenantCount,
            split_type: isShared ? 'room_sharing' : 'individual',
            elec_amount: tenantElecShare,
            electricity_amount: tenantElecShare,
            rent_amount: rent,
            arrears: arrears,
            other_charges: other,
            total_payable: total,
            payment_status: total === 0 ? 'Paid' : 'Unpaid',
          };

          const createdBill = await api.createBill(billPayload);
          results.push({
            success: true,
            room,
            tenant,
            billId: createdBill.id,
            createdBill,
            tenantId: tenant.id,
            totalPayable: total,
            message: `Bill generated for ${tenant.name}`
          });
        }
      }

      // Update room's meter reading if submeter
      if (isSubmeter) {
        if (currReading > prevReading) {
          try {
            await api.updateRoom(room.id, { current_meter_reading: currReading });
          } catch (_) {}
        }
      }
    } catch (err) {
      results.push({ success: false, room, error: err.message || String(err) });
    }
  }

  return results;
}

