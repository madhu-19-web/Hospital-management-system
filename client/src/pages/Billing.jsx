import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Printer, 
  FileText, 
  Trash2, 
  X, 
  DollarSign, 
  CreditCard,
  Building,
  Activity
} from 'lucide-react';

export default function Billing({ onRefreshStats }) {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingLoading, setViewingLoading] = useState(false);

  // New Invoice Form state
  const [formData, setFormData] = useState({
    patient_id: '',
    bill_date: new Date().toISOString().split('T')[0],
    discount: 0,
    payment_method: 'Credit Card',
    notes: '',
    mark_as_paid: false,
    items: [
      { description: 'Specialist Doctor Consultation', quantity: 1, unit_price: 100 }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = statusFilter !== 'All' ? `/api/bills?status=${encodeURIComponent(statusFilter)}` : '/api/bills';
      const [billRes, patRes] = await Promise.all([
        fetch(url),
        fetch('/api/patients')
      ]);
      const [billData, patData] = await Promise.all([billRes.json(), patRes.json()]);
      setBills(billData);
      setPatients(patData);

      if (patData.length > 0 && !formData.patient_id) {
        setFormData(prev => ({ ...prev, patient_id: patData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const viewReceipt = async (id) => {
    try {
      setViewingLoading(true);
      const res = await fetch(`/api/bills/${id}`);
      const data = await res.json();
      setViewingBill(data);
    } catch (err) {
      console.error('Failed to load receipt:', err);
    } finally {
      setViewingLoading(false);
    }
  };

  const handlePayBill = async (id, method = 'Credit Card') => {
    try {
      await fetch(`/api/bills/${id}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: method })
      });
      fetchData();
      if (onRefreshStats) onRefreshStats();
      if (viewingBill && viewingBill.id === id) {
        viewReceipt(id);
      }
    } catch (err) {
      console.error('Failed to pay bill:', err);
    }
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((acc, item) => {
      return acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0));
    }, 0);
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowNewModal(false);
        setFormData({
          patient_id: patients[0]?.id || '',
          bill_date: new Date().toISOString().split('T')[0],
          discount: 0,
          payment_method: 'Credit Card',
          notes: '',
          mark_as_paid: false,
          items: [{ description: 'Specialist Doctor Consultation', quantity: 1, unit_price: 100 }]
        });
        fetchData();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err) {
      console.error('Failed to create bill:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-xs text-slate-500">Generate itemized patient invoices, collect payments, and print medical receipts.</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-teal-600/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-2">
        <span className="text-xs font-bold text-slate-700 mr-1">Filter Payment Status:</span>
        {['All', 'Pending', 'Paid'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === st
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Billing Date</th>
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading invoices...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No invoices found for this filter.</td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      #INV-{b.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {b.bill_date}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{b.patient_name}</p>
                      <p className="text-xs text-slate-400">{b.patient_phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 text-sm">
                        ${b.total_amount - b.discount}
                      </p>
                      {b.discount > 0 && (
                        <p className="text-[11px] text-emerald-600 font-medium">(${b.discount} disc applied)</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          b.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {b.status === 'Pending' && (
                          <button
                            onClick={() => handlePayBill(b.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            Collect Payment
                          </button>
                        )}
                        <button
                          onClick={() => viewReceipt(b.id)}
                          className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                          title="View & Print Statement"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Invoice Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Generate Patient Invoice</h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient *</label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (#{p.id.toString().padStart(4, '0')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.bill_date}
                    onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Line Items List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Line Items & Services *</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        required
                        placeholder="Service description (e.g. Lab Panel, Bed Observation, ECG)"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-teal-500"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-teal-500 text-center"
                      />
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                          className="w-20 px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:border-teal-500 text-right"
                        />
                      </div>
                      <span className="w-20 text-right text-xs font-bold text-slate-700">
                        ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal and Discount */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-bold text-slate-800">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-600">Discount ($):</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-24 px-2 py-1 text-xs bg-white rounded-lg border border-slate-300 text-right font-semibold"
                  />
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Net Total Payable:</span>
                  <span className="text-teal-700">
                    ${Math.max(0, calculateSubtotal() - (parseFloat(formData.discount) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mark_as_paid}
                    onChange={(e) => setFormData({ ...formData, mark_as_paid: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>Mark as Paid immediately</span>
                </label>

                {formData.mark_as_paid && (
                  <div>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Insurance Claim">Insurance Claim</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Print Receipt Modal */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto print:m-0 print:p-0">
            {/* Action Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 print:hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Medical Receipt</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewingBill(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Document */}
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    <h2 className="font-extrabold text-lg tracking-tight text-slate-900">CarePulse Health Hospital</h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">100 Healthcare Parkway, Metro City</p>
                  <p className="text-[11px] text-slate-500">Tel: +1 (555) 019-2830 &bull; contact@carepulse.org</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono font-black text-slate-800">
                    #INV-{viewingBill.id.toString().padStart(4, '0')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{viewingBill.bill_date}</p>
                  <span
                    className={`inline-block mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      viewingBill.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viewingBill.status}
                  </span>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-800 text-sm">{viewingBill.patient_name}</p>
                <p className="text-slate-500 mt-0.5">
                  Phone: {viewingBill.patient_phone || 'N/A'} &bull; Blood: {viewingBill.patient_blood || 'N/A'}
                </p>
                {viewingBill.patient_address && <p className="text-slate-500">{viewingBill.patient_address}</p>}
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Service / Procedure</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingBill.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="p-3 font-medium text-slate-800">{item.description}</td>
                        <td className="p-3 text-center text-slate-600">{item.quantity}</td>
                        <td className="p-3 text-right text-slate-600">${item.unit_price}</td>
                        <td className="p-3 text-right font-bold text-slate-800">${item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-right pr-2">
                <p className="text-slate-500">Gross Total: <span className="font-semibold text-slate-800">${viewingBill.total_amount}</span></p>
                {viewingBill.discount > 0 && (
                  <p className="text-emerald-600">Discount: -${viewingBill.discount}</p>
                )}
                <p className="text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                  Total Payable: ${(viewingBill.total_amount - viewingBill.discount).toFixed(2)}
                </p>
                {viewingBill.payment_method && (
                  <p className="text-[11px] text-slate-400">Payment Tender: {viewingBill.payment_method}</p>
                )}
              </div>

              {/* Receipt Footer */}
              <div className="pt-4 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                <p>Thank you for choosing CarePulse Medical Center. Keep this statement for tax or health insurance claim records.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
