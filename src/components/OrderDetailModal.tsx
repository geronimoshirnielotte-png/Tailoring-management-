import React, { useState } from 'react';
import { Order, OrderStatus, PaymentRecord, ShopSettings } from '../types';
import { formatCurrency, getOrderPaymentSummary } from '../utils/storage';
import { X, Printer, CheckCircle, Clock, Scissors, CreditCard, ShieldCheck } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAddPayment: (orderId: string, payment: Omit<PaymentRecord, 'id'>) => void;
  onPrint: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  settings,
  onClose,
  onUpdateStatus,
  onAddPayment,
  onPrint,
}) => {
  if (!order) return null;

  const { totalPaid, balance, paymentStatus } = getOrderPaymentSummary(order);

  // Payment form state
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState<string>(balance > 0 ? balance.toString() : '');
  const [payMethod, setPayMethod] = useState<'Cash' | 'GCash' | 'Bank Transfer' | 'Maya'>('Cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(payAmount);
    if (isNaN(num) || num <= 0) return;

    onAddPayment(order.id, {
      date: new Date().toISOString().slice(0, 10),
      amount: num,
      method: payMethod,
      referenceNumber: payRef || undefined,
      notes: payNotes || undefined,
    });

    setShowPayForm(false);
    setPayRef('');
    setPayNotes('');
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: '1. Pending / Quote' },
    { value: 'cutting', label: '2. Fabric Cutting & Prep' },
    { value: 'fitting', label: '3. Basting / 1st Fitting' },
    { value: 'finishing', label: '4. Final Sewing & Details' },
    { value: 'ready', label: '5. Ready for Claim / Pickup' },
    { value: 'completed', label: '6. Completed & Released' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-900">{order.orderNumber}</span>
              {order.priority === 'rush' && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">RUSH ORDER</span>
              )}
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-600">{order.garmentType}</span>
            </div>
            <div className="text-xs text-slate-500">
              <span>Client: <strong className="text-slate-800">{order.customerName}</strong> ({order.customerPhone})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(order)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip & Claim Stub</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Stepper & Control */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Workflow Stage</span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stepper visualization */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center text-xs">
              {[
                { key: 'cutting', label: 'Cutting' },
                { key: 'fitting', label: '1st Fitting' },
                { key: 'finishing', label: 'Finishing' },
                { key: 'ready', label: 'Ready' },
                { key: 'completed', label: 'Released' },
              ].map((step, idx) => {
                const stepOrder: OrderStatus[] = ['pending', 'cutting', 'fitting', 'finishing', 'ready', 'completed'];
                const currentIdx = stepOrder.indexOf(order.status);
                const isPassed = currentIdx >= stepOrder.indexOf(step.key as OrderStatus);
                const isCurrent = order.status === step.key;

                return (
                  <div
                    key={step.key}
                    className={`py-2 px-1 rounded border ${
                      isCurrent
                        ? 'bg-amber-100/70 border-amber-300 text-amber-900 font-bold'
                        : isPassed
                        ? 'bg-slate-200/60 border-slate-300 text-slate-800 font-medium'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{idx + 1}. {step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timing & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Order Placed</span>
              <span className="font-semibold text-slate-800">{order.orderDate}</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Fitting Target</span>
              <span className="font-semibold text-slate-800">{order.targetFittingDate || 'To be scheduled'}</span>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-0.5">Target Completion / Due</span>
              <span className="font-bold text-rose-700">{order.dueDate}</span>
            </div>
          </div>

          {/* Garment & Fabric Specification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Garment & Textile Specifications</h4>
            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Garment Description</span>
                <p className="text-slate-800 mt-0.5 font-medium leading-relaxed">{order.garmentDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block">Fabric Type</span>
                  <span className="font-semibold text-slate-800">{order.fabricDetails.fabricType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Color / Pattern</span>
                  <span className="font-semibold text-slate-800">{order.fabricDetails.colorPattern}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fabric Supply</span>
                  <span className="font-semibold text-slate-800">
                    {order.fabricDetails.suppliedBy === 'shop' ? 'Provided by Atelier' : 'Supplied by Customer'}
                    {order.fabricDetails.yardageMeters ? ` (${order.fabricDetails.yardageMeters}m)` : ''}
                  </span>
                </div>
              </div>

              {order.fabricDetails.specialInstructions && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block">Cutter & Tailor Instructions</span>
                  <p className="text-slate-700 italic mt-0.5">{order.fabricDetails.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Measurements Snapshot Recorded for this Garment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Measurement Snapshot ({order.measurementsSnapshot.unit})
              </h4>
              <span className="text-xs text-slate-400">Locked to this Job Order</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs">
                {order.measurementsSnapshot.chestBust && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Chest/Bust</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.chestBust}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.waist && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Waist</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.waist}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.fullHip && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hips</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.fullHip}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.shoulderWidth && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Shoulder</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.shoulderWidth}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.sleeveLength && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sleeve</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.sleeveLength}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.neck && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Neck</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.neck}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.frontLength && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Front Length</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.frontLength}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.inseam && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Inseam</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.inseam}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.outseam && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Outseam</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.outseam}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.thigh && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thigh</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.thigh}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.crotch && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Crotch/Rise</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.crotch}"
                    </span>
                  </div>
                )}
                {order.measurementsSnapshot.armhole && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Armhole</span>
                    <span className="font-semibold font-mono text-slate-900 tabular-nums">
                      {order.measurementsSnapshot.armhole}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financials & Payments Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Financial Breakdown & Payment Ledger
              </h4>
              <button
                onClick={() => setShowPayForm(!showPayForm)}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                {showPayForm ? 'Cancel' : '+ Record Payment'}
              </button>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
              <div className="grid grid-cols-3 gap-4 text-xs pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block">Total Agreed Price</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatCurrency(order.totalAmount, settings.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Paid Amount</span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(totalPaid, settings.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Remaining Balance</span>
                  <span className={`text-sm font-bold tabular-nums ${balance > 0 ? 'text-amber-800' : 'text-slate-400'}`}>
                    {balance > 0 ? formatCurrency(balance, settings.currency) : 'Settled'}
                  </span>
                </div>
              </div>

              {/* Add Payment Form */}
              {showPayForm && (
                <form onSubmit={handleRecordPayment} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-3">
                  <div className="text-xs font-semibold text-amber-900">Record New Payment Entry</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Amount ({settings.currency})</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-800 font-mono"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Method</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as any)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-800"
                      >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Maya">Maya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Reference / Receipt #</label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-800"
                        placeholder="OR-001 or GCash Ref"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Notes (Optional)</label>
                    <input
                      type="text"
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-800"
                      placeholder="e.g. 2nd fitting installment"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPayForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded shadow-xs"
                    >
                      Save Payment
                    </button>
                  </div>
                </form>
              )}

              {/* Transactions List */}
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Payment History</span>
                {order.payments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No payments logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {order.payments.map((p) => (
                      <div key={p.id} className="py-2 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{p.method}</span>
                          {p.referenceNumber && <span className="text-slate-500 font-mono ml-2">({p.referenceNumber})</span>}
                          <span className="text-slate-400 text-[11px] ml-2">· {p.date}</span>
                          {p.notes && <p className="text-slate-500 text-[11px] italic">{p.notes}</p>}
                        </div>
                        <span className="font-bold font-mono text-emerald-700 tabular-nums">
                          +{formatCurrency(p.amount, settings.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assigned Cutter/Tailor: <strong className="text-slate-700">{order.assignedTailor}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
