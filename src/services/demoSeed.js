/**
 * demoSeed.js
 * Seeds localStorage with realistic demo data for interview / portfolio demos.
 * Call seedDemoData() once on first load, resetDemoData() to restore to baseline.
 */

export const DEMO_OWNER_ID = 'mock_owner_id';
const SEED_KEY = '_demo_seeded_v5';

/* ── helpers ── */
const s = (key, data) => localStorage.setItem(key, JSON.stringify(data));

function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 8)}`;
}

/* ── static IDs so data stays referentially consistent ── */
const IDS = {
  // Properties
  prop1: 'demo_prop_suraj',
  prop2: 'demo_prop_green',

  // Rooms — Suraj Niwas
  r101: 'demo_room_101',
  r102: 'demo_room_102',
  r103: 'demo_room_103',
  r104: 'demo_room_104',
  r105: 'demo_room_105',

  // Rooms — Green Valley
  g201: 'demo_room_201',
  g202: 'demo_room_202',
  g203: 'demo_room_203',

  // Tenants
  t1: 'demo_t_rahul',
  t2: 'demo_t_priya',
  t3: 'demo_t_amit',
  t4: 'demo_t_kiran',
  t5: 'demo_t_deepak',
  t6: 'demo_t_sneha',
  t7: 'demo_t_mohit',
  t8: 'demo_t_ananya',

  // Leases
  l1: 'demo_lease_1', l2: 'demo_lease_2',
  l3: 'demo_lease_3', l4: 'demo_lease_4',
  l5: 'demo_lease_5', l6: 'demo_lease_6',
  l7: 'demo_lease_7', l8: 'demo_lease_8',
};

/* ── build demo dataset ── */
function buildDemoData() {
  const now = new Date();
  const thisYear = now.getFullYear();

  /* ── Properties ── */
  const properties = [
    {
      id: IDS.prop1,
      owner_id: DEMO_OWNER_ID,
      name: 'Suraj Niwas PG',
      address: 'Plot 14, Andheri West, Mumbai — 400053',
      created_at: '2024-01-10T08:00:00.000Z',
    },
    {
      id: IDS.prop2,
      owner_id: DEMO_OWNER_ID,
      name: 'Green Valley Hostel',
      address: 'Flat 3B, Malad East, Mumbai — 400097',
      created_at: '2024-03-05T08:00:00.000Z',
    },
  ];

  /* ── Rooms ── */
  const rooms = [
    // Suraj Niwas PG
    {
      id: IDS.r101, property_id: IDS.prop1, room_number: '101', floor: '1',
      room_type: 'Single Room', base_rent: 9500, status: 'Occupied',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 3412, rate_per_unit: 8,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-01-12T08:00:00.000Z',
    },
    {
      id: IDS.r102, property_id: IDS.prop1, room_number: '102', floor: '1',
      room_type: 'Single Room', base_rent: 8000, status: 'Occupied',
      elec_mode: 'fixed', has_submeter: false,
      current_meter_reading: 0, rate_per_unit: 8,
      direct_elec_amount: 0, fixed_elec_amount: 600,
      created_at: '2024-01-12T08:00:00.000Z',
    },
    {
      id: IDS.r103, property_id: IDS.prop1, room_number: '103', floor: '1',
      room_type: 'Shared Room', base_rent: 6500, status: 'Occupied',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 1870, rate_per_unit: 8,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-01-12T08:00:00.000Z',
    },
    {
      id: IDS.r104, property_id: IDS.prop1, room_number: '104', floor: '2',
      room_type: 'Single Room', base_rent: 10500, status: 'Occupied',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 5244, rate_per_unit: 8,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-01-12T08:00:00.000Z',
    },
    {
      id: IDS.r105, property_id: IDS.prop1, room_number: '105', floor: '2',
      room_type: 'Single Room', base_rent: 9000, status: 'Vacant',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 0, rate_per_unit: 8,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-01-12T08:00:00.000Z',
    },
    // Green Valley Hostel
    {
      id: IDS.g201, property_id: IDS.prop2, room_number: 'G-201', floor: '2',
      room_type: 'Single Room', base_rent: 7500, status: 'Occupied',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 2108, rate_per_unit: 9,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-03-08T08:00:00.000Z',
    },
    {
      id: IDS.g202, property_id: IDS.prop2, room_number: 'G-202', floor: '2',
      room_type: 'Single Room', base_rent: 8500, status: 'Occupied',
      elec_mode: 'direct', has_submeter: false,
      current_meter_reading: 0, rate_per_unit: 9,
      direct_elec_amount: 750, fixed_elec_amount: 0,
      created_at: '2024-03-08T08:00:00.000Z',
    },
    {
      id: IDS.g203, property_id: IDS.prop2, room_number: 'G-203', floor: '3',
      room_type: 'Single Room', base_rent: 7000, status: 'Vacant',
      elec_mode: 'submeter', has_submeter: true,
      current_meter_reading: 0, rate_per_unit: 9,
      direct_elec_amount: 0, fixed_elec_amount: 0,
      created_at: '2024-03-08T08:00:00.000Z',
    },
  ];

  /* ── Tenants ── */
  const tenants = [
    { id: IDS.t1, owner_id: DEMO_OWNER_ID, name: 'Rahul Sharma', phone: '9867452310', email: 'rahul.sharma@gmail.com', active: true, created_at: '2024-01-15T08:00:00.000Z' },
    { id: IDS.t2, owner_id: DEMO_OWNER_ID, name: 'Priya Mehta', phone: '9823456780', email: 'priya.mehta@gmail.com', active: true, created_at: '2024-01-20T08:00:00.000Z' },
    { id: IDS.t3, owner_id: DEMO_OWNER_ID, name: 'Amit Verma', phone: '9712345678', email: '', active: true, created_at: '2024-02-01T08:00:00.000Z' },
    { id: IDS.t4, owner_id: DEMO_OWNER_ID, name: 'Kiran Rao', phone: '9845612300', email: '', active: true, created_at: '2024-02-01T08:00:00.000Z' },
    { id: IDS.t5, owner_id: DEMO_OWNER_ID, name: 'Deepak Joshi', phone: '9934561200', email: 'deepak.j@outlook.com', active: true, created_at: '2024-02-15T08:00:00.000Z' },
    { id: IDS.t6, owner_id: DEMO_OWNER_ID, name: 'Sneha Patel', phone: '9090123456', email: 'sneha.patel@yahoo.com', active: true, created_at: '2024-03-10T08:00:00.000Z' },
    { id: IDS.t7, owner_id: DEMO_OWNER_ID, name: 'Mohit Singh', phone: '9876001234', email: '', active: true, created_at: '2024-03-10T08:00:00.000Z' },
    { id: IDS.t8, owner_id: DEMO_OWNER_ID, name: 'Ananya Nair', phone: '9560234567', email: 'ananya.nair@gmail.com', active: false, created_at: '2024-01-01T08:00:00.000Z' },
  ];

  /* ── Leases ── */
  const leases = [
    { id: IDS.l1, tenant_id: IDS.t1, room_id: IDS.r101, start_date: '2024-01-15', end_date: null, is_active: true, created_at: '2024-01-15T08:00:00.000Z' },
    { id: IDS.l2, tenant_id: IDS.t2, room_id: IDS.r102, start_date: '2024-01-20', end_date: null, is_active: true, created_at: '2024-01-20T08:00:00.000Z' },
    { id: IDS.l3, tenant_id: IDS.t3, room_id: IDS.r103, start_date: '2024-02-01', end_date: null, is_active: true, created_at: '2024-02-01T08:00:00.000Z' },
    { id: IDS.l4, tenant_id: IDS.t4, room_id: IDS.r103, start_date: '2024-02-01', end_date: null, is_active: true, created_at: '2024-02-01T08:00:00.000Z' },
    { id: IDS.l5, tenant_id: IDS.t5, room_id: IDS.r104, start_date: '2024-02-15', end_date: null, is_active: true, created_at: '2024-02-15T08:00:00.000Z' },
    { id: IDS.l6, tenant_id: IDS.t6, room_id: IDS.g201, start_date: '2024-03-10', end_date: null, is_active: true, created_at: '2024-03-10T08:00:00.000Z' },
    { id: IDS.l7, tenant_id: IDS.t7, room_id: IDS.g202, start_date: '2024-03-10', end_date: null, is_active: true, created_at: '2024-03-10T08:00:00.000Z' },
    { id: IDS.l8, tenant_id: IDS.t8, room_id: IDS.r101, start_date: '2024-01-01', end_date: '2024-01-14', is_active: false, created_at: '2024-01-01T08:00:00.000Z' },
  ];

  /* ── Bills ──
   * Build 3 months (July, August, September) with varied statuses.
   * September = current month context for demo purposes.
   */
  const billYear = thisYear;

  const bills = [
    // ── JULY (all fully paid) ──
    // Rahul — R101 — submeter (prev 3050 → 3210, 160u × ₹8 = ₹1280)
    { id: 'demo_bill_jul_t1', room_id: IDS.r101, tenant_id: IDS.t1, bill_month: 'July', bill_year: billYear, previous_reading: 3050, current_reading: 3210, units_consumed: 160, rate_per_unit: 8, rent_amount: 9500, arrears: 0, other_charges: 0, total_payable: 10780, amount_paid: 10780, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Priya — R102 — fixed elec ₹600
    { id: 'demo_bill_jul_t2', room_id: IDS.r102, tenant_id: IDS.t2, bill_month: 'July', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8000, arrears: 0, other_charges: 0, total_payable: 8600, amount_paid: 8600, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Amit — R103 shared (prev 1620 → 1730, 110u × ₹8 = ₹880, split ₹440 each)
    { id: 'demo_bill_jul_t3', room_id: IDS.r103, tenant_id: IDS.t3, bill_month: 'July', bill_year: billYear, previous_reading: 1620, current_reading: 1730, units_consumed: 110, rate_per_unit: 8, rent_amount: 6500, arrears: 0, other_charges: 0, total_payable: 6940, amount_paid: 6940, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Kiran — R103 shared
    { id: 'demo_bill_jul_t4', room_id: IDS.r103, tenant_id: IDS.t4, bill_month: 'July', bill_year: billYear, previous_reading: 1620, current_reading: 1730, units_consumed: 110, rate_per_unit: 8, rent_amount: 6500, arrears: 0, other_charges: 0, total_payable: 6940, amount_paid: 6940, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Deepak — R104 (prev 4900 → 5060, 160u × ₹8 = ₹1280)
    { id: 'demo_bill_jul_t5', room_id: IDS.r104, tenant_id: IDS.t5, bill_month: 'July', bill_year: billYear, previous_reading: 4900, current_reading: 5060, units_consumed: 160, rate_per_unit: 8, rent_amount: 10500, arrears: 0, other_charges: 0, total_payable: 11780, amount_paid: 11780, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Sneha — G201 (prev 1800 → 1920, 120u × ₹9 = ₹1080)
    { id: 'demo_bill_jul_t6', room_id: IDS.g201, tenant_id: IDS.t6, bill_month: 'July', bill_year: billYear, previous_reading: 1800, current_reading: 1920, units_consumed: 120, rate_per_unit: 9, rent_amount: 7500, arrears: 0, other_charges: 0, total_payable: 8580, amount_paid: 8580, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },
    // Mohit — G202 — direct elec ₹750
    { id: 'demo_bill_jul_t7', room_id: IDS.g202, tenant_id: IDS.t7, bill_month: 'July', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8500, arrears: 0, other_charges: 0, total_payable: 9250, amount_paid: 9250, payment_status: 'Paid', generated_at: `${billYear}-07-03T10:00:00.000Z` },

    // ── AUGUST ──
    // Rahul — R101 — Paid (prev 3210 → 3340)
    { id: 'demo_bill_aug_t1', room_id: IDS.r101, tenant_id: IDS.t1, bill_month: 'August', bill_year: billYear, previous_reading: 3210, current_reading: 3340, units_consumed: 130, rate_per_unit: 8, rent_amount: 9500, arrears: 0, other_charges: 0, total_payable: 10540, amount_paid: 10540, payment_status: 'Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Priya — R102 — Paid
    { id: 'demo_bill_aug_t2', room_id: IDS.r102, tenant_id: IDS.t2, bill_month: 'August', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8000, arrears: 0, other_charges: 0, total_payable: 8600, amount_paid: 8600, payment_status: 'Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Amit — R103 shared — Partially Paid (paid only ₹5000 of ₹6980)
    { id: 'demo_bill_aug_t3', room_id: IDS.r103, tenant_id: IDS.t3, bill_month: 'August', bill_year: billYear, previous_reading: 1730, current_reading: 1850, units_consumed: 120, rate_per_unit: 8, rent_amount: 6500, arrears: 0, other_charges: 0, total_payable: 6980, amount_paid: 5000, payment_status: 'Partially Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Kiran — R103 shared — Paid
    { id: 'demo_bill_aug_t4', room_id: IDS.r103, tenant_id: IDS.t4, bill_month: 'August', bill_year: billYear, previous_reading: 1730, current_reading: 1850, units_consumed: 120, rate_per_unit: 8, rent_amount: 6500, arrears: 0, other_charges: 0, total_payable: 6980, amount_paid: 6980, payment_status: 'Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Deepak — R104 — Partially Paid (paid ₹8000 of ₹12060)
    { id: 'demo_bill_aug_t5', room_id: IDS.r104, tenant_id: IDS.t5, bill_month: 'August', bill_year: billYear, previous_reading: 5060, current_reading: 5245, units_consumed: 185, rate_per_unit: 8, rent_amount: 10500, arrears: 0, other_charges: 200, total_payable: 12180, amount_paid: 8000, payment_status: 'Partially Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Sneha — G201 — Paid (prev 1920 → 2020)
    { id: 'demo_bill_aug_t6', room_id: IDS.g201, tenant_id: IDS.t6, bill_month: 'August', bill_year: billYear, previous_reading: 1920, current_reading: 2020, units_consumed: 100, rate_per_unit: 9, rent_amount: 7500, arrears: 0, other_charges: 0, total_payable: 8400, amount_paid: 8400, payment_status: 'Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },
    // Mohit — G202 — Paid
    { id: 'demo_bill_aug_t7', room_id: IDS.g202, tenant_id: IDS.t7, bill_month: 'August', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8500, arrears: 0, other_charges: 0, total_payable: 9250, amount_paid: 9250, payment_status: 'Paid', generated_at: `${billYear}-08-04T10:00:00.000Z` },

    // ── SEPTEMBER (current month — mostly unpaid for demo tension) ──
    // Rahul — R101 — Unpaid (prev 3340 → 3412, 72u × ₹8 = ₹576)
    { id: 'demo_bill_sep_t1', room_id: IDS.r101, tenant_id: IDS.t1, bill_month: 'September', bill_year: billYear, previous_reading: 3340, current_reading: 3412, units_consumed: 72, rate_per_unit: 8, rent_amount: 9500, arrears: 0, other_charges: 0, total_payable: 10076, amount_paid: 0, payment_status: 'Unpaid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Priya — R102 — Paid (always on time!)
    { id: 'demo_bill_sep_t2', room_id: IDS.r102, tenant_id: IDS.t2, bill_month: 'September', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8000, arrears: 0, other_charges: 0, total_payable: 8600, amount_paid: 8600, payment_status: 'Paid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Amit — R103 — Unpaid (with arrears from Aug partial)
    { id: 'demo_bill_sep_t3', room_id: IDS.r103, tenant_id: IDS.t3, bill_month: 'September', bill_year: billYear, previous_reading: 1850, current_reading: 1870, units_consumed: 20, rate_per_unit: 8, rent_amount: 6500, arrears: 1980, other_charges: 0, total_payable: 8640, amount_paid: 0, payment_status: 'Unpaid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Kiran — R103 — Unpaid
    { id: 'demo_bill_sep_t4', room_id: IDS.r103, tenant_id: IDS.t4, bill_month: 'September', bill_year: billYear, previous_reading: 1850, current_reading: 1870, units_consumed: 20, rate_per_unit: 8, rent_amount: 6500, arrears: 0, other_charges: 0, total_payable: 6660, amount_paid: 0, payment_status: 'Unpaid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Deepak — R104 — Unpaid (with arrears from Aug partial ₹4180)
    { id: 'demo_bill_sep_t5', room_id: IDS.r104, tenant_id: IDS.t5, bill_month: 'September', bill_year: billYear, previous_reading: 5245, current_reading: 5310, units_consumed: 65, rate_per_unit: 8, rent_amount: 10500, arrears: 4180, other_charges: 0, total_payable: 15200, amount_paid: 0, payment_status: 'Unpaid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Sneha — G201 — Unpaid (prev 2020 → 2108)
    { id: 'demo_bill_sep_t6', room_id: IDS.g201, tenant_id: IDS.t6, bill_month: 'September', bill_year: billYear, previous_reading: 2020, current_reading: 2108, units_consumed: 88, rate_per_unit: 9, rent_amount: 7500, arrears: 0, other_charges: 0, total_payable: 8292, amount_paid: 0, payment_status: 'Unpaid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
    // Mohit — G202 — Partially Paid (paid ₹5000 of ₹9250)
    { id: 'demo_bill_sep_t7', room_id: IDS.g202, tenant_id: IDS.t7, bill_month: 'September', bill_year: billYear, previous_reading: 0, current_reading: 0, units_consumed: 0, rate_per_unit: 0, rent_amount: 8500, arrears: 0, other_charges: 0, total_payable: 9250, amount_paid: 5000, payment_status: 'Partially Paid', generated_at: `${billYear}-09-05T10:00:00.000Z` },
  ];

  /* ── Payments (mirror what's recorded in bills) ── */
  const payments = [
    // July — all paid
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t1', amount_paid: 10780, payment_date: `${billYear}-07-05`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t2', amount_paid: 8600, payment_date: `${billYear}-07-06`, payment_method: 'Cash' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t3', amount_paid: 6940, payment_date: `${billYear}-07-06`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t4', amount_paid: 6940, payment_date: `${billYear}-07-07`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t5', amount_paid: 11780, payment_date: `${billYear}-07-05`, payment_method: 'Bank Transfer' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t6', amount_paid: 8580, payment_date: `${billYear}-07-08`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_jul_t7', amount_paid: 9250, payment_date: `${billYear}-07-08`, payment_method: 'Cash' },

    // August — partial
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t1', amount_paid: 10540, payment_date: `${billYear}-08-07`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t2', amount_paid: 8600, payment_date: `${billYear}-08-06`, payment_method: 'Cash' },
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t3', amount_paid: 5000, payment_date: `${billYear}-08-12`, payment_method: 'UPI' }, // partial
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t4', amount_paid: 6980, payment_date: `${billYear}-08-07`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t5', amount_paid: 8000, payment_date: `${billYear}-08-10`, payment_method: 'Cash' }, // partial
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t6', amount_paid: 8400, payment_date: `${billYear}-08-08`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_aug_t7', amount_paid: 9250, payment_date: `${billYear}-08-09`, payment_method: 'UPI' },

    // September — only Priya paid
    { id: makeId('pay'), bill_id: 'demo_bill_sep_t2', amount_paid: 8600, payment_date: `${billYear}-09-07`, payment_method: 'UPI' },
    { id: makeId('pay'), bill_id: 'demo_bill_sep_t7', amount_paid: 5000, payment_date: `${billYear}-09-10`, payment_method: 'Cash' }, // Mohit partial
  ];

  /* ── Deposits ── */
  const deposits = [
    { id: makeId('dep'), owner_id: DEMO_OWNER_ID, tenant_id: IDS.t1, room_id: IDS.r101, property_id: IDS.prop1, amount: 19000, collected_date: '2024-01-15', status: 'held', deductions: [], notes: '2 months security', return_amount: null, return_date: null, created_at: '2024-01-15T08:00:00.000Z' },
    { id: makeId('dep'), owner_id: DEMO_OWNER_ID, tenant_id: IDS.t2, room_id: IDS.r102, property_id: IDS.prop1, amount: 16000, collected_date: '2024-01-20', status: 'held', deductions: [], notes: '', return_amount: null, return_date: null, created_at: '2024-01-20T08:00:00.000Z' },
    { id: makeId('dep'), owner_id: DEMO_OWNER_ID, tenant_id: IDS.t5, room_id: IDS.r104, property_id: IDS.prop1, amount: 21000, collected_date: '2024-02-15', status: 'held', deductions: [], notes: '', return_amount: null, return_date: null, created_at: '2024-02-15T08:00:00.000Z' },
    { id: makeId('dep'), owner_id: DEMO_OWNER_ID, tenant_id: IDS.t6, room_id: IDS.g201, property_id: IDS.prop2, amount: 15000, collected_date: '2024-03-10', status: 'held', deductions: [], notes: '', return_amount: null, return_date: null, created_at: '2024-03-10T08:00:00.000Z' },
    { id: makeId('dep'), owner_id: DEMO_OWNER_ID, tenant_id: IDS.t8, room_id: IDS.r101, property_id: IDS.prop1, amount: 19000, collected_date: '2024-01-01', status: 'returned', deductions: [], notes: 'Vacated after 2 weeks', return_amount: 19000, return_date: '2024-01-14', created_at: '2024-01-01T08:00:00.000Z' },
  ];

  return { properties, rooms, tenants, leases, bills, payments, deposits };
}

/* ── Public API ── */


export function isDemoSeeded() {
  return !!localStorage.getItem(SEED_KEY);
}

export function seedDemoData(force = false) {
  if (!force && isDemoSeeded()) return; // idempotent — only seed once

  const { properties, rooms, tenants, leases, bills, payments, deposits } = buildDemoData();

  // Clean out any existing demo data first to ensure no duplication
  const existing = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  const nonDemo = (key, filterFn) => existing(key).filter(filterFn);

  // Preserve non-demo data if any, but replace all demo records cleanly
  const existingProps = nonDemo('mock_properties', p => p.owner_id !== DEMO_OWNER_ID);
  const demoPropIds = properties.map(p => p.id);
  const existingRooms = nonDemo('mock_rooms', r => !demoPropIds.includes(r.property_id));
  const existingTenants = nonDemo('mock_tenants', t => t.owner_id !== DEMO_OWNER_ID);
  const demoTenantIds = tenants.map(t => t.id);
  const existingLeases = nonDemo('mock_leases', l => !demoTenantIds.includes(l.tenant_id));
  const demoRoomIds = rooms.map(r => r.id);
  const existingBills = nonDemo('mock_bills', b => !demoRoomIds.includes(b.room_id));
  const demoBillIds = bills.map(b => b.id);
  const existingPayments = nonDemo('mock_payments', p => !demoBillIds.includes(p.bill_id));
  const existingDeposits = nonDemo('mock_deposits', d => d.owner_id !== DEMO_OWNER_ID);

  s('mock_properties', [...existingProps, ...properties]);
  s('mock_rooms', [...existingRooms, ...rooms]);
  s('mock_tenants', [...existingTenants, ...tenants]);
  s('mock_leases', [...existingLeases, ...leases]);
  s('mock_bills', [...existingBills, ...bills]);
  s('mock_payments', [...existingPayments, ...payments]);
  s('mock_deposits', [...existingDeposits, ...deposits]);
  localStorage.setItem(SEED_KEY, '1');
  localStorage.setItem('_migration_amount_paid_done', '1');
}

export function resetDemoData() {
  const existing = (key) => JSON.parse(localStorage.getItem(key) || '[]');

  // 1. Identify all demo property IDs
  const allProps = existing('mock_properties');
  const demoPropIds = allProps.filter(p => p.owner_id === DEMO_OWNER_ID).map(p => p.id);

  // 2. Identify all demo room IDs
  const allRooms = existing('mock_rooms');
  const demoRoomIds = allRooms.filter(r => demoPropIds.includes(r.property_id)).map(r => r.id);

  // 3. Identify all demo tenant IDs
  const allTenants = existing('mock_tenants');
  const demoTenantIds = allTenants.filter(t => t.owner_id === DEMO_OWNER_ID).map(t => t.id);

  // 4. Identify all demo bill IDs
  const allBills = existing('mock_bills');
  const demoBillIds = allBills.filter(b => demoRoomIds.includes(b.room_id)).map(b => b.id);

  // Clean out each store
  s('mock_properties', allProps.filter(p => p.owner_id !== DEMO_OWNER_ID));
  s('mock_rooms', allRooms.filter(r => !demoPropIds.includes(r.property_id)));
  s('mock_tenants', allTenants.filter(t => t.owner_id !== DEMO_OWNER_ID));
  s('mock_leases', existing('mock_leases').filter(l => !demoTenantIds.includes(l.tenant_id) && !demoRoomIds.includes(l.room_id)));
  s('mock_bills', allBills.filter(b => !demoRoomIds.includes(b.room_id)));
  s('mock_payments', existing('mock_payments').filter(p => !demoBillIds.includes(p.bill_id)));
  s('mock_deposits', existing('mock_deposits').filter(d => d.owner_id !== DEMO_OWNER_ID));

  // Remove seed flag so next seed is clean
  localStorage.removeItem(SEED_KEY);
}
