import React, { useState, useRef } from 'react';
import { Customer, GarmentCategory, Order, ShopSettings } from '../types';
import { formatCurrency, getOrderPaymentSummary, exportFullDatabaseBackup, restoreDatabaseBackup, resetToSeedData } from '../utils/storage';
import { Calculator, MessageSquare, Download, Upload, RefreshCw, Copy, Check, Shield, Layers, ArrowLeftRight } from 'lucide-react';

interface TailorToolsViewProps {
  orders: Order[];
  customers: Customer[];
  settings: ShopSettings;
  onUpdateSettings: (settings: ShopSettings) => void;
  onDataReset: () => void;
}

export const TailorToolsView: React.FC<TailorToolsViewProps> = ({
  orders,
  customers,
  settings,
  onUpdateSettings,
  onDataReset,
}) => {
  // --- 1. Yardage Estimator State ---
  const [calcGarment, setCalcGarment] = useState<GarmentCategory>('Barong Tagalog');
  const [boltWidth, setBoltWidth] = useState<'45' | '60'>('60');
  const [sizeTier, setSizeTier] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [hasLining, setHasLining] = useState(true);

  const calculateYardage = () => {
    let baseMeters = 2.5;
    if (calcGarment === 'Barong Tagalog') baseMeters = 3.0;
    else if (calcGarment === 'Business Suit / Blazer') baseMeters = 3.5;
    else if (calcGarment === 'Slacks / Trousers') baseMeters = 1.8;
    else if (calcGarment === 'Filipiniana / Terno') baseMeters = 4.2;
    else if (calcGarment === 'Evening Gown') baseMeters = 5.0;
    else if (calcGarment === 'School / Office Uniform') baseMeters = 2.8;

    // Width adjustment: 45" cloth needs ~20% more length than 60"
    if (boltWidth === '45') baseMeters *= 1.25;

    // Size tier adjustment
    if (sizeTier === 'large') baseMeters *= 1.15;
    if (sizeTier === 'xlarge') baseMeters *= 1.3;
    if (sizeTier === 'small') baseMeters *= 0.9;

    const liningMeters = hasLining ? Math.max(1.5, baseMeters * 0.75) : 0;

    return {
      fabricMeters: parseFloat(baseMeters.toFixed(2)),
      liningMeters: parseFloat(liningMeters.toFixed(2)),
    };
  };

  const yardageResult = calculateYardage();

  // --- 2. SMS Generator State ---
  const [selectedOrderForSms, setSelectedOrderForSms] = useState<string>(orders[0]?.id || '');
  const [smsTemplateType, setSmsTemplateType] = useState<'fitting' | 'ready' | 'payment'>('ready');
  const [copiedSms, setCopiedSms] = useState(false);

  const activeSmsOrder = orders.find((o) => o.id === selectedOrderForSms) || orders[0];
  const { balance } = activeSmsOrder ? getOrderPaymentSummary(activeSmsOrder) : { balance: 0 };

  const generateSmsMessage = () => {
    if (!activeSmsOrder) return '';
    if (smsTemplateType === 'fitting') {
      return `Good day ${activeSmsOrder.customerName}! Your ${activeSmsOrder.garmentType} (Order #${activeSmsOrder.orderNumber}) is now ready for your 1st basting fitting. Please visit ${settings.shopName} at ${settings.address} on ${activeSmsOrder.targetFittingDate || 'your earliest convenience'}. Thank you!`;
    } else if (smsTemplateType === 'ready') {
      return `Good day ${activeSmsOrder.customerName}! Great news from ${settings.shopName}: your custom ${activeSmsOrder.garmentType} (Order #${activeSmsOrder.orderNumber}) is finished, pressed, and ready for pickup! Remaining balance payable: ${formatCurrency(balance, settings.currency)}. Kindly bring your claim stub upon release. Thank you!`;
    } else {
      return `Payment Acknowledgment: Thank you ${activeSmsOrder.customerName} for settling payment on ${settings.shopName} (Order #${activeSmsOrder.orderNumber}). Remaining balance: ${formatCurrency(balance, settings.currency)}. Target completion: ${activeSmsOrder.dueDate}.`;
    }
  };

  const handleCopySms = () => {
    const text = generateSmsMessage();
    navigator.clipboard.writeText(text);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  // --- 3. Backup & Security State ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = restoreDatabaseBackup(content);
      if (res.success) {
        setRestoreMessage({ type: 'success', text: res.message });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setRestoreMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
  };

  // --- 4. Measurement Comparator State ---
  const [diffCustId, setDiffCustId] = useState<string>(customers[0]?.id || '');
  const diffCust = customers.find((c) => c.id === diffCustId) || customers[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Tailor Utilities & System Security Suite</h1>
        <p className="text-xs text-slate-500">
          Productivity calculators, customer notification generators, and database backup controls ensuring complete record preservation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Estimator & SMS Generator */}
        <div className="lg:col-span-6 space-y-8">
          {/* Tool 1: Fabric Yardage Estimator */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-4 h-4 text-amber-800" />
              <h2 className="text-sm font-bold text-slate-900">Bespoke Fabric Yardage Estimator</h2>
            </div>
            <p className="text-xs text-slate-500">
              Calculate standard meterage required based on bolt width and garment pattern complexity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Garment Type</label>
                <select
                  value={calcGarment}
                  onChange={(e) => setCalcGarment(e.target.value as GarmentCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  <option value="Barong Tagalog">Barong Tagalog</option>
                  <option value="Filipiniana / Terno">Filipiniana / Terno</option>
                  <option value="Business Suit / Blazer">Business Suit / Blazer</option>
                  <option value="Slacks / Trousers">Slacks / Trousers</option>
                  <option value="Evening Gown">Evening Gown</option>
                  <option value="School / Office Uniform">Office Uniform</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Fabric Bolt Width</label>
                <select
                  value={boltWidth}
                  onChange={(e) => setBoltWidth(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  <option value="60">60 inches (Double Width)</option>
                  <option value="45">45 inches (Single Width)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Client Size Profile</label>
                <select
                  value={sizeTier}
                  onChange={(e) => setSizeTier(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  <option value="small">Small (34" - 36" Chest)</option>
                  <option value="medium">Medium (38" - 40" Chest)</option>
                  <option value="large">Large (42" - 44" Chest)</option>
                  <option value="xlarge">Extra Large (46"+ Chest)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasLining}
                    onChange={(e) => setHasLining(e.target.checked)}
                    className="rounded border-slate-300 text-amber-800"
                  />
                  <span>Include Inner Lining</span>
                </label>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-900 font-semibold uppercase tracking-wider block">
                  Recommended Bolt Purchase
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {yardageResult.fabricMeters} meters
                </span>
                <span className="text-xs text-slate-500 block">
                  ({(yardageResult.fabricMeters * 1.09361).toFixed(2)} yards of {boltWidth}" fabric)
                </span>
              </div>

              {hasLining && (
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Lining Fabric</span>
                  <span className="text-lg font-bold font-mono text-slate-800 tabular-nums">
                    {yardageResult.liningMeters} m
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tool 2: Customer SMS & Notification Generator */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-4 h-4 text-amber-800" />
              <h2 className="text-sm font-bold text-slate-900">Customer SMS & Claim Alert Dispatcher</h2>
            </div>
            <p className="text-xs text-slate-500">
              Generate standardized SMS messages for fitting invitations, release claim notices, and receipts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Select Order</label>
                <select
                  value={selectedOrderForSms}
                  onChange={(e) => setSelectedOrderForSms(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.customerName} ({o.garmentType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Message Purpose</label>
                <select
                  value={smsTemplateType}
                  onChange={(e) => setSmsTemplateType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  <option value="ready">Finished Garment Ready for Pick-up</option>
                  <option value="fitting">1st Basting Fitting Invitation</option>
                  <option value="payment">Downpayment Acknowledgment</option>
                </select>
              </div>
            </div>

            {/* Generated Message Display */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>SMS Preview (To: {activeSmsOrder?.customerPhone})</span>
                <span className="font-mono text-[11px]">{generateSmsMessage().length} chars</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 border border-slate-200 rounded font-sans">
                {generateSmsMessage()}
              </p>

              <button
                onClick={handleCopySms}
                className="w-full py-2 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {copiedSms ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSms ? 'Copied to Clipboard!' : 'Copy SMS Message'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Database Backup, Data Security & Role Switcher (Objective #4) */}
        <div className="lg:col-span-6 space-y-8">
          {/* Security & Backup Management (Addresses Problem #3 & Objective #4) */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">
                Data Preservation, Backup & Security Module
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fulfills <strong>Objective 4</strong>: "To implement basic data security features such as backup and user access control to ensure customer records are safe from loss or unauthorized access." Protects against moisture, fire, pest damage, and accidental loss of paper notebooks.
            </p>

            {restoreMessage && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  restoreMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {restoreMessage.text}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {/* One-Click Backup */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">Download System Backup (JSON)</span>
                  <span className="text-[11px] text-slate-500 block">
                    Exports {customers.length} customer measurement profiles and {orders.length} order ledger files.
                  </span>
                </div>
                <button
                  onClick={exportFullDatabaseBackup}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Backup</span>
                </button>
              </div>

              {/* Restore Backup */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">Restore Database from Backup</span>
                  <span className="text-[11px] text-slate-500 block">
                    Upload a previously exported .json backup file to restore records.
                  </span>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileRestore}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Restore</span>
                  </button>
                </div>
              </div>

              {/* Reset to Seed Data */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 block">Reset Demonstration Data</span>
                  <span className="text-[11px] text-slate-500 block">
                    Restores initial curated Barong, Filipiniana, and tailoring demo datasets.
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all records to factory demonstration seed data?')) {
                      resetToSeedData();
                      onDataReset();
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Data</span>
                </button>
              </div>
            </div>

            {/* Role-Based Access Control Simulation (Objective #4) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                User Access Control (RBAC Simulation)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => onUpdateSettings({ ...settings, activeRole: 'master_tailor' })}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.activeRole === 'master_tailor'
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-bold">Master Tailor (Full Admin)</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Full pricing edits, client delete permissions, database export.
                  </div>
                </button>

                <button
                  onClick={() => onUpdateSettings({ ...settings, activeRole: 'staff_cutter' })}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    settings.activeRole === 'staff_cutter'
                      ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="font-bold">Cutter / Assistant Mode</div>
                  <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Cutting tickets & measurement viewing only; financial totals locked.
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Historical Measurement Comparator */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ArrowLeftRight className="w-4 h-4 text-amber-800" />
              <h2 className="text-sm font-bold text-slate-900">Measurement Revision Delta Comparator</h2>
            </div>
            <p className="text-xs text-slate-500">
              Instantly detects bodily measurement changes across visits, identifying where patterns require adjustment.
            </p>

            <div>
              <label className="block text-slate-600 text-xs mb-1">Select Customer</label>
              <select
                value={diffCustId}
                onChange={(e) => setDiffCustId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.measurementsHistory.length} recorded revisions)
                  </option>
                ))}
              </select>
            </div>

            {diffCust && diffCust.measurementsHistory.length > 1 ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-slate-600">
                  Comparing Initial ({diffCust.measurementsHistory[0].date}) vs Latest (
                  {diffCust.measurementsHistory[diffCust.measurementsHistory.length - 1].date}):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {['chestBust', 'waist', 'fullHip', 'shoulderWidth'].map((key) => {
                    const firstVal = (diffCust.measurementsHistory[0] as any)[key] || 0;
                    const lastVal = (diffCust.measurementsHistory[diffCust.measurementsHistory.length - 1] as any)[key] || 0;
                    const diff = lastVal - firstVal;
                    return (
                      <div key={key} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                        <span className="text-[10px] text-slate-400 capitalize block">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {firstVal}" → {lastVal}"
                        </div>
                        <div
                          className={`text-[11px] font-semibold font-mono ${
                            diff > 0 ? 'text-amber-700' : diff < 0 ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {diff > 0 ? `+${diff}"` : diff < 0 ? `${diff}"` : 'No change'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded text-xs text-slate-500 italic">
                This customer has 1 measurement record. As new revisions are logged, changes will be compared automatically here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
