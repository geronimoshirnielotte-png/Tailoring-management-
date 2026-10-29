import React from 'react';
import { Order, ShopSettings } from '../types';
import { formatCurrency, getOrderPaymentSummary } from '../utils/storage';
import { Printer, X, Scissors, CheckCircle2 } from 'lucide-react';

interface PrintClaimStubModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
}

export const PrintClaimStubModal: React.FC<PrintClaimStubModalProps> = ({ order, settings, onClose }) => {
  if (!order) return null;

  const { totalPaid, balance } = getOrderPaymentSummary(order);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-6">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Print Preview: Job Order & Customer Claim Stub</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded transition-colors shadow-sm"
            >
              Print Now
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div className="print-container p-8 space-y-6 text-slate-900 bg-white">
          {/* ================= SECTION 1: MASTER ATELIER WORK TICKET ================= */}
          <div className="border border-slate-300 rounded-lg p-5 space-y-4 bg-slate-50/30">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">{settings.shopName}</h2>
                <p className="text-[11px] text-slate-500">{settings.tagline}</p>
                <p className="text-[11px] text-slate-500">{settings.address} · {settings.contactNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Master Cutting Ticket</span>
                <span className="text-base font-bold font-mono text-slate-900">{order.orderNumber}</span>
                {order.priority === 'rush' && (
                  <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                    RUSH ORDER
                  </span>
                )}
              </div>
            </div>

            {/* Client & Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Customer</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
                <span className="text-slate-500 block text-[11px]">{order.customerPhone}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Garment</span>
                <span className="font-bold text-slate-900">{order.garmentType}</span>
                <span className="text-slate-500 block text-[11px]">{order.fabricDetails.colorPattern}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">1st Fitting Date</span>
                <span className="font-bold text-slate-900">{order.targetFittingDate || 'TBD'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Release Due Date</span>
                <span className="font-bold text-rose-700">{order.dueDate}</span>
              </div>
            </div>

            {/* Garment Details & Instructions */}
            <div className="text-xs space-y-1.5 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Description & Styling</span>
                <p className="text-slate-800 leading-relaxed font-medium">{order.garmentDescription}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-[11px] text-slate-600">
                <span>Fabric: <strong>{order.fabricDetails.fabricType}</strong></span>
                <span>Supply: <strong>{order.fabricDetails.suppliedBy === 'shop' ? 'Atelier Fabric' : 'Customer Fabric'}</strong></span>
                <span>Lining: <strong>{order.fabricDetails.liningRequired ? 'Required' : 'None'}</strong></span>
              </div>
              {order.fabricDetails.specialInstructions && (
                <div className="p-2 bg-amber-50/60 border border-amber-200/60 rounded text-[11px] text-amber-900">
                  <strong>Cutter Alert:</strong> {order.fabricDetails.specialInstructions}
                </div>
              )}
            </div>

            {/* Measurement Grid (Inches) */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Cutting Dimensions ({order.measurementsSnapshot.unit})
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs">
                {order.measurementsSnapshot.chestBust && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Chest/Bust</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.chestBust}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.waist && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Waist</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.waist}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.fullHip && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Hips</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.fullHip}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.shoulderWidth && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Shoulder</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.shoulderWidth}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.sleeveLength && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Sleeve</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.sleeveLength}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.neck && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Neck</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.neck}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.frontLength && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Front Len</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.frontLength}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.inseam && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Inseam</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.inseam}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.outseam && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Outseam</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.outseam}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.thigh && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Thigh</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.thigh}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.crotch && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Crotch/Rise</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.crotch}"</span>
                  </div>
                )}
                {order.measurementsSnapshot.bottomHem && (
                  <div className="border border-slate-200 p-1.5 rounded bg-white">
                    <span className="text-[10px] text-slate-400 block">Leg Hem</span>
                    <span className="font-bold font-mono">{order.measurementsSnapshot.bottomHem}"</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Assigned Tailor: <strong>{order.assignedTailor}</strong></span>
              <span>Total Contract: <strong className="font-mono text-slate-900">{formatCurrency(order.totalAmount, settings.currency)}</strong></span>
            </div>
          </div>

          {/* TEAR OFF PERFORATION LINE */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-b-2 border-dashed border-slate-400" />
            <div className="absolute bg-white px-3 text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-400" />
              <span>TEAR-OFF PERFORATION · CUSTOMER COPY BELOW</span>
            </div>
          </div>

          {/* ================= SECTION 2: CUSTOMER CLAIM STUB & RECEIPT ================= */}
          <div className="border-2 border-slate-900 rounded-lg p-5 space-y-4 bg-white">
            <div className="flex items-start justify-between border-b border-slate-300 pb-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-slate-900">{settings.shopName}</h3>
                <p className="text-[11px] text-slate-600">OFFICIAL CUSTOMER CLAIM STUB</p>
                <p className="text-[10px] text-slate-500">{settings.contactNumber} · {settings.email}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-900 block">{order.orderNumber}</span>
                <span className="text-[10px] text-slate-500 block">Order Date: {order.orderDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Customer Name</span>
                <span className="font-bold text-slate-800">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Garment Type</span>
                <span className="font-bold text-slate-800">{order.garmentType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ready for Claim On</span>
                <span className="font-bold text-rose-700">{order.dueDate}</span>
              </div>
            </div>

            {/* Financial Ledger on Claim Stub */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Agreed</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(order.totalAmount, settings.currency)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Deposit Paid</span>
                  <span className="font-bold font-mono text-emerald-700">{formatCurrency(totalPaid, settings.currency)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Balance Payable</span>
                  <span className={`font-bold font-mono ${balance > 0 ? 'text-amber-900 font-extrabold' : 'text-slate-400'}`}>
                    {balance > 0 ? formatCurrency(balance, settings.currency) : 'Fully Settled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Barcode identifier */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-[10px] text-slate-500 max-w-sm space-y-0.5">
                <p className="font-semibold text-slate-700">Important Reminders:</p>
                <p>1. Please present this physical claim stub upon releasing the garment.</p>
                <p>2. Fitting adjustments requested within 14 calendar days of release are complimentary.</p>
                <p>3. Remaining balance must be settled prior to garment release.</p>
              </div>

              {/* Simulated barcode */}
              <div className="text-center font-mono">
                <div className="tracking-[3px] text-lg font-bold text-slate-900">
                  ||| | | |||| | ||| |||| |
                </div>
                <div className="text-[10px] text-slate-400">{order.orderNumber}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Close Preview
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
