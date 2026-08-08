import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Receipt, DollarSign, Eye, ShieldAlert, Check, X, Filter, Printer, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/Toast';

export default function Billing() {
  const { user } = useAuth();
  const toast = useToast();

  // Database lists
  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI state
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Payment Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [billPayments, setBillPayments] = useState([]);

  const receiptRef = useRef(null);

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user?.id || 'mock_owner_id';

      const [billsList, tenantsList, roomsList] = await Promise.all([
        api.getBills(ownerId),
        api.getTenants(ownerId),
        api.getAllRooms(ownerId)
      ]);

      setBills(billsList);
      setTenants(tenantsList);
      setRooms(roomsList);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch billing history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);


  const handleOpenPayModal = async (bill) => {
    setSelectedBill(bill);
    const remaining = parseFloat(bill.total_payable) - parseFloat(bill.amount_paid || 0);
    setPayAmount(remaining > 0 ? remaining.toString() : '0');
    setPayMethod('UPI');
    
    // Fetch payments made for this bill
    try {
      const list = await api.getPayments(bill.id);
      setBillPayments(list);
    } catch (err) {
      console.error(err);
    }
    
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !payAmount) return;
    setError('');

    try {
      await api.recordPayment(selectedBill.id, parseFloat(payAmount), payMethod);
      setShowPayModal(false);
      setSelectedBill(null);
      await loadBillingData();
      toast('Payment successfully recorded!', 'success');
    } catch (err) {
      console.error(err);
      setError('Failed to record payment');
    }
  };

  const getTenantName = (tenantId) => {
    const t = tenants.find(ten => ten.id === tenantId);
    return t ? t.name : 'Unknown Tenant';
  };

  const getRoomNumber = (roomId) => {
    const r = rooms.find(room => room.id === roomId);
    return r ? `Room ${r.room_number}` : 'Unknown Room';
  };

  const handleDownloadPDF = async () => {
    if (!selectedBill || !receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill_${getTenantName(selectedBill.tenant_id)}_${selectedBill.bill_month}.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!selectedBill || !receiptRef.current) return;

    try {
      const tenantName = getTenantName(selectedBill.tenant_id);
      const text = `*RENT RECEIPT*\nMonth: ${selectedBill.bill_month} ${selectedBill.bill_year}\nTenant: ${tenantName}\nTotal: ₹${parseFloat(selectedBill.total_payable).toFixed(2)}`;

      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `Bill_${tenantName}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Invoice Receipt',
          text: text
        });
      } else {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Filtering list
  const filteredBills = bills.filter(b => {
    if (statusFilter === 'All') return true;
    return b.payment_status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up active">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Billing & Invoices</h1>
          <p className="text-slate-400 mt-1 text-sm">Review historical billing records and record payments.</p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">Filter:</span>
          <select
            className="bg-slate-900 text-xs font-bold text-slate-200 focus:outline-none cursor-pointer border border-slate-700 rounded-lg px-2 py-1"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All" className="bg-slate-900 text-slate-200">All Invoices</option>
            <option value="Paid" className="bg-slate-900 text-slate-200">Paid</option>
            <option value="Partially Paid" className="bg-slate-900 text-slate-200">Partially Paid</option>
            <option value="Unpaid" className="bg-slate-900 text-slate-200">Unpaid</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Billing Table List */}
      {filteredBills.length === 0 ? (
        <div className="card glass-card p-12 text-center text-slate-500 text-sm">
          No invoices match the selected filter.
        </div>
      ) : (
        <div className="card glass-card overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="table w-full text-left">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Tenant Name</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Billing Month</th>
                  <th className="px-6 py-4 font-mono">Cons. Units</th>
                  <th className="px-6 py-4">Payable Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="border-b border-slate-850 hover:bg-slate-900/10 last:border-0">
                    <td className="px-6 py-4 font-semibold text-slate-200">{getTenantName(bill.tenant_id)}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{getRoomNumber(bill.room_id)}</td>
                    <td className="px-6 py-4 text-slate-400">{bill.bill_month} {bill.bill_year}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">{parseFloat(bill.units_consumed).toFixed(2)} u</td>
                    <td className="px-6 py-4 font-bold text-slate-200">₹{parseFloat(bill.total_payable).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        bill.payment_status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : bill.payment_status === 'Partially Paid' 
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="btn btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:text-blue-400"
                          title="Open Bill Details"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>
                        
                        {bill.payment_status !== 'Paid' && (
                          <button
                            onClick={() => handleOpenPayModal(bill)}
                            className="btn btn-primary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                          >
                            <DollarSign size={12} />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bill View Detail Modal - Rendered in Portal to avoid parent overflow clipping */}
      {selectedBill && !showPayModal && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="card glass-card w-full max-w-lg border-slate-800 bg-slate-900 shadow-2xl relative my-auto">
            <button 
              onClick={() => setSelectedBill(null)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-5 sm:p-6 space-y-5">
              <h3 className="font-bold text-slate-200 text-base pr-8">Invoice Details</h3>
              
              {/* Receipt Visual wrapper */}
              <div className="border border-slate-800 rounded-xl max-h-[60vh] overflow-y-auto bg-slate-950 p-2 sm:p-3">
                <div ref={receiptRef} className="receipt-paper w-full" style={{ padding: '20px', color: '#1e293b' }}>
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold uppercase tracking-wider text-slate-800">INVOICE RECEIPT</div>
                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{selectedBill.bill_month} {selectedBill.bill_year}</div>
                    <div style={{ borderBottom: '2px solid #cbd5e1', margin: '8px 0' }}></div>
                  </div>

                  <div className="flex justify-between items-start gap-4 mb-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">TENANT</span>
                      <span className="font-bold text-slate-900 text-sm">{getTenantName(selectedBill.tenant_id)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">ROOM</span>
                      <span className="font-bold text-slate-800 text-sm">{getRoomNumber(selectedBill.room_id)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3 bg-white border border-slate-100 rounded-lg p-2.5">
                    <div className="flex justify-between">
                      <span>Base Monthly Rent:</span>
                      <span className="font-semibold text-slate-800">₹{parseFloat(selectedBill.rent_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consumed Electricity Units:</span>
                      <span className="font-semibold text-slate-800">{parseFloat(selectedBill.units_consumed).toFixed(2)} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Per Unit:</span>
                      <span className="font-semibold text-slate-800">₹{parseFloat(selectedBill.rate_per_unit).toFixed(2)}/unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electricity Charges:</span>
                      <span className="font-semibold text-slate-800">₹{(parseFloat(selectedBill.units_consumed) * parseFloat(selectedBill.rate_per_unit)).toFixed(2)}</span>
                    </div>
                    {selectedBill.other_charges > 0 && (
                      <div className="flex justify-between">
                        <span>Other Charges:</span>
                        <span className="font-semibold text-slate-800">₹{parseFloat(selectedBill.other_charges).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedBill.arrears > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>Arrears / Unpaid Balance:</span>
                        <span className="font-semibold">₹{parseFloat(selectedBill.arrears).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '2px solid #0f172a', paddingTop: '8px', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                    <span className="font-bold text-slate-900 text-sm">TOTAL AMOUNT:</span>
                    <span className="font-bold text-blue-600 text-base">₹{parseFloat(selectedBill.total_payable).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={handleDownloadPDF} 
                  className="btn btn-primary rounded-xl flex-1 justify-center py-2.5 text-xs flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button 
                  onClick={handleShareWhatsApp} 
                  className="btn bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2.5 px-4 text-xs flex items-center gap-1.5"
                >
                  <Share2 size={14} /> Share WhatsApp
                </button>
                <button 
                  onClick={() => setSelectedBill(null)} 
                  className="btn btn-secondary rounded-xl py-2.5 px-4 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Record Payment Modal */}
      {showPayModal && selectedBill && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="card glass-card w-full max-w-md border-slate-800 bg-slate-900 shadow-2xl relative my-auto">
            <button 
              onClick={() => setShowPayModal(false)} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-200 text-base">Record Payment Receipt</h3>
                <p className="text-xs text-slate-500">Receive payment for {getTenantName(selectedBill.tenant_id)}'s invoice.</p>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="form-group">
                  <label className="input-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-input bg-slate-950"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Remaining: ₹{(parseFloat(selectedBill.total_payable) - parseFloat(selectedBill.amount_paid || 0)).toFixed(2)} of ₹{selectedBill.total_payable} total
                  </span>
                </div>

                <div className="form-group">
                  <label className="input-label">Payment Method</label>
                  <select
                    className="form-input bg-slate-950 text-slate-200"
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value)}
                  >
                    <option value="UPI" className="bg-slate-900 text-slate-200">UPI / Net Banking</option>
                    <option value="Cash" className="bg-slate-900 text-slate-200">Cash Payment</option>
                    <option value="Bank Transfer" className="bg-slate-900 text-slate-200">Direct Bank Transfer</option>
                  </select>
                </div>

                {/* History of payments already recorded */}
                {billPayments.length > 0 && (
                  <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs">
                    <span className="font-semibold text-slate-400">Payments History:</span>
                    {billPayments.map((p, idx) => (
                      <div key={p.id || idx} className="flex justify-between text-slate-400 font-mono">
                        <span>{p.payment_date} ({p.payment_method})</span>
                        <span className="text-emerald-400">+₹{p.amount_paid}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn btn-primary py-2.5 px-4 rounded-xl flex-1 text-xs">
                    Record Payment
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPayModal(false)} 
                    className="btn btn-secondary py-2.5 px-4 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
