// Indian Currency and Date Formatting Utilities

export const formatINR = (amount) => {
  const num = parseFloat(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatINRShort = (amount) => {
  const num = parseFloat(amount || 0);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return formatINR(num);
};

export const formatDateIN = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns month index 0-11 for a given month name (case-insensitive) or undefined
 */
export const getMonthIndex = (monthName) => {
  if (!monthName) return -1;
  const lower = String(monthName).trim().toLowerCase();
  return MONTH_NAMES.findIndex(m => m.toLowerCase() === lower);
};

/**
 * Compare two (month, year) pairs chronologically.
 * Returns negative if A < B, positive if A > B, 0 if equal.
 */
export const compareBillingPeriod = (monthA, yearA, monthB, yearB) => {
  const yA = Number(yearA) || 0;
  const yB = Number(yearB) || 0;
  if (yA !== yB) return yA - yB;
  const mA = getMonthIndex(monthA);
  const mB = getMonthIndex(monthB);
  return mA - mB;
};

/**
 * Get the unpaid balance of ONLY the most recent previous bill prior to (targetMonth, targetYear)
 * for a specific tenant and room.
 * This prevents double-counting earlier months whose arrears were already rolled into the last bill.
 */
export const getPreviousBillDue = (bills, roomId, tenantId, targetMonth, targetYear) => {
  if (!Array.isArray(bills) || bills.length === 0) return 0;

  // Filter bills strictly belonging to this tenant (or room) AND prior to the target billing period
  const priorBills = bills.filter(b => {
    // Match room
    if (roomId && b.room_id && b.room_id !== roomId) return false;
    // Match tenant if tenantId is provided
    if (tenantId && b.tenant_id && b.tenant_id !== tenantId) return false;

    // Check chronological order: must be strictly BEFORE the bill currently being created
    if (targetMonth && targetYear) {
      const cmp = compareBillingPeriod(b.bill_month, b.bill_year, targetMonth, targetYear);
      if (cmp >= 0) return false; // same month or future month
    }
    return true;
  });

  if (priorBills.length === 0) return 0;

  // Sort prior bills descending (newest first)
  priorBills.sort((a, b) => {
    const cmp = compareBillingPeriod(b.bill_month, b.bill_year, a.bill_month, a.bill_year);
    if (cmp !== 0) return cmp;
    // If same month/year, fallback to generated_at or created_at descending
    const dateA = new Date(a.generated_at || a.created_at || 0).getTime();
    const dateB = new Date(b.generated_at || b.created_at || 0).getTime();
    return dateB - dateA;
  });

  // Take the most recent bill prior to target month
  const mostRecentBill = priorBills[0];
  const payable = parseFloat(mostRecentBill.total_payable || 0);
  const paid = parseFloat(mostRecentBill.amount_paid || 0);
  const due = Math.max(0, payable - paid);

  return due;
};

