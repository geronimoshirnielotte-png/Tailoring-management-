import React, { useState } from 'react';
import { Customer, GarmentCategory, MeasurementSet, Order, ShopSettings } from '../types';
import { X, Sparkles, Scissors, Calendar, UserCheck } from 'lucide-react';

interface OrderFormModalProps {
  customers: Customer[];
  settings: ShopSettings;
  onClose: () => void;
  onSubmit: (newOrder: Order, newCustomer?: Customer) => void;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  customers,
  settings,
  onClose,
  onSubmit,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || 'new');
  
  // New Customer fields (if 'new' selected)
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustGender, setNewCustGender] = useState<'male' | 'female' | 'unisex'>('male');

  // Garment Category
  const [garmentType, setGarmentType] = useState<GarmentCategory>('Barong Tagalog');
  const [garmentDescription, setGarmentDescription] = useState('');
  const [fabricType, setFabricType] = useState('Piña-Jusi Fabric');
  const [colorPattern, setColorPattern] = useState('Natural Ecru Hand Embroidered');
  const [suppliedBy, setSuppliedBy] = useState<'shop' | 'customer'>('shop');
  const [yardageMeters, setYardageMeters] = useState('3.5');
  const [liningRequired, setLiningRequired] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Dates
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const defaultFit = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [orderDate, setOrderDate] = useState(todayStr);
  const [targetFittingDate, setTargetFittingDate] = useState(defaultFit);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [priority, setPriority] = useState<'normal' | 'rush'>('normal');
  const [assignedTailor, setAssignedTailor] = useState('Mang Nestor (Master Cutter)');

  // Financials
  const [totalAmount, setTotalAmount] = useState('12000');
  const [depositAmount, setDepositAmount] = useState('6000');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Bank Transfer' | 'Maya'>('GCash');
  const [paymentRef, setPaymentRef] = useState('');

  // Quick Measurements
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId);
  const latestMeas = activeCustomer?.measurementsHistory[activeCustomer.measurementsHistory.length - 1];

  const [chestBust, setChestBust] = useState(latestMeas?.chestBust?.toString() || '40');
  const [waist, setWaist] = useState(latestMeas?.waist?.toString() || '34');
  const [fullHip, setFullHip] = useState(latestMeas?.fullHip?.toString() || '40');
  const [shoulderWidth, setShoulderWidth] = useState(latestMeas?.shoulderWidth?.toString() || '18');
  const [sleeveLength, setSleeveLength] = useState(latestMeas?.sleeveLength?.toString() || '25');
  const [frontLength, setFrontLength] = useState(latestMeas?.frontLength?.toString() || '30');
  const [inseam, setInseam] = useState(latestMeas?.inseam?.toString() || '31');
  const [outseam, setOutseam] = useState(latestMeas?.outseam?.toString() || '41');

  // When customer changes, autofill their latest measurements
  const handleCustomerChange = (id: string) => {
    setSelectedCustomerId(id);
    if (id !== 'new') {
      const cust = customers.find((c) => c.id === id);
      if (cust && cust.measurementsHistory.length > 0) {
        const m = cust.measurementsHistory[cust.measurementsHistory.length - 1];
        if (m.chestBust) setChestBust(m.chestBust.toString());
        if (m.waist) setWaist(m.waist.toString());
        if (m.fullHip) setFullHip(m.fullHip.toString());
        if (m.shoulderWidth) setShoulderWidth(m.shoulderWidth.toString());
        if (m.sleeveLength) setSleeveLength(m.sleeveLength.toString());
        if (m.frontLength) setFrontLength(m.frontLength.toString());
        if (m.inseam) setInseam(m.inseam.toString());
        if (m.outseam) setOutseam(m.outseam.toString());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustomerId = selectedCustomerId;
    let customerName = '';
    let customerPhone = '';
    let newCustomerObj: Customer | undefined = undefined;

    if (selectedCustomerId === 'new') {
      if (!newCustName.trim()) return;
      const newId = `cust-${Date.now()}`;
      finalCustomerId = newId;
      customerName = newCustName.trim();
      customerPhone = newCustPhone.trim() || 'N/A';

      const initialMeas: MeasurementSet = {
        id: `meas-${Date.now()}`,
        customerId: newId,
        date: todayStr,
        unit: 'inches',
        chestBust: parseFloat(chestBust) || undefined,
        waist: parseFloat(waist) || undefined,
        fullHip: parseFloat(fullHip) || undefined,
        shoulderWidth: parseFloat(shoulderWidth) || undefined,
        sleeveLength: parseFloat(sleeveLength) || undefined,
        frontLength: parseFloat(frontLength) || undefined,
        inseam: parseFloat(inseam) || undefined,
        outseam: parseFloat(outseam) || undefined,
      };

      newCustomerObj = {
        id: newId,
        code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: customerName,
        gender: newCustGender,
        phone: customerPhone,
        email: newCustEmail.trim() || '',
        address: 'Registered Walk-In',
        notes: `Order created: ${garmentType}`,
        registeredDate: todayStr,
        measurementsHistory: [initialMeas],
      };
    } else {
      const existing = customers.find((c) => c.id === selectedCustomerId);
      customerName = existing?.fullName || 'Walk-in Client';
      customerPhone = existing?.phone || '';
    }

    const measurementSnapshot: MeasurementSet = {
      id: `meas-snap-${Date.now()}`,
      customerId: finalCustomerId,
      date: orderDate,
      unit: 'inches',
      chestBust: parseFloat(chestBust) || undefined,
      waist: parseFloat(waist) || undefined,
      fullHip: parseFloat(fullHip) || undefined,
      shoulderWidth: parseFloat(shoulderWidth) || undefined,
      sleeveLength: parseFloat(sleeveLength) || undefined,
      frontLength: parseFloat(frontLength) || undefined,
      inseam: parseFloat(inseam) || undefined,
      outseam: parseFloat(outseam) || undefined,
    };

    const parsedTotal = parseFloat(totalAmount) || 0;
    const parsedDeposit = parseFloat(depositAmount) || 0;

    const initialPayments = parsedDeposit > 0 ? [
      {
        id: `pay-${Date.now()}`,
        date: orderDate,
        amount: parsedDeposit,
        method: paymentMethod,
        referenceNumber: paymentRef || undefined,
        notes: 'Initial deposit upon booking order',
      }
    ] : [];

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: finalCustomerId,
      customerName,
      customerPhone,
      garmentType,
      garmentDescription: garmentDescription.trim() || `${garmentType} - Bespoke cut in ${fabricType}`,
      fabricDetails: {
        fabricType,
        colorPattern,
        suppliedBy,
        yardageMeters: parseFloat(yardageMeters) || undefined,
        liningRequired,
        specialInstructions: specialInstructions.trim() || undefined,
      },
      measurementsSnapshot: measurementSnapshot,
      orderDate,
      targetFittingDate: targetFittingDate || undefined,
      dueDate,
      priority,
      status: 'pending',
      totalAmount: parsedTotal,
      payments: initialPayments,
      assignedTailor,
    };

    onSubmit(newOrder, newCustomerObj);
  };

  const garmentCategories: GarmentCategory[] = [
    'Barong Tagalog',
    'Filipiniana / Terno',
    'Business Suit / Blazer',
    'Slacks / Trousers',
    'Evening Gown',
    'School / Office Uniform',
    'Tailored Dress',
    'Polo & Shirt',
    'Alteration & Repair',
    'Custom Vest',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">New Garment Order Booking</h2>
            <p className="text-xs text-slate-300">Record customer specifications, body measurements snapshot, and initial deposit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs">
          {/* Step 1: Client Selection */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider">1. Customer Information</span>
              <span className="text-slate-500">Auto-links saved measurements</span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium text-slate-900"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.fullName} ({c.phone})
                  </option>
                ))}
                <option value="new">+ Register New Walk-in Customer</option>
              </select>
            </div>

            {selectedCustomerId === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Mateo dela Cruz"
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Gender</label>
                  <select
                    value={newCustGender}
                    onChange={(e) => setNewCustGender(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-300 rounded"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Garment Specifications */}
          <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 uppercase tracking-wider block">2. Garment & Fabric Details</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Garment Category</label>
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value as GarmentCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium text-slate-900"
                >
                  {garmentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Fabric Type</label>
                <input
                  type="text"
                  required
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  placeholder="e.g. Piña Organza, Linen, Wool Gabardine"
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Color / Texture</label>
                <input
                  type="text"
                  value={colorPattern}
                  onChange={(e) => setColorPattern(e.target.value)}
                  placeholder="e.g. Navy Blue, Ivory, Calado embroidery"
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Cloth Provided By</label>
                <select
                  value={suppliedBy}
                  onChange={(e) => setSuppliedBy(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                >
                  <option value="shop">Atelier Inventory</option>
                  <option value="customer">Client Brought Own Fabric</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Yardage / Meters</label>
                <input
                  type="number"
                  step="0.1"
                  value={yardageMeters}
                  onChange={(e) => setYardageMeters(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Design Specifications / Special Notes</label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. High collar, French cuffs, double rear vent, mother of pearl buttons, pick stitching on lapels..."
                className="w-full p-2 bg-white border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Step 3: Body Measurements for this order */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider">3. Body Measurements (Inches)</span>
              <span className="text-slate-500">Auto-filled from client profile</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Chest / Bust</label>
                <input
                  type="number"
                  step="0.25"
                  value={chestBust}
                  onChange={(e) => setChestBust(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Waist</label>
                <input
                  type="number"
                  step="0.25"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Hips</label>
                <input
                  type="number"
                  step="0.25"
                  value={fullHip}
                  onChange={(e) => setFullHip(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Shoulder Width</label>
                <input
                  type="number"
                  step="0.25"
                  value={shoulderWidth}
                  onChange={(e) => setShoulderWidth(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Sleeve Length</label>
                <input
                  type="number"
                  step="0.25"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Front Length</label>
                <input
                  type="number"
                  step="0.25"
                  value={frontLength}
                  onChange={(e) => setFrontLength(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Inseam (Trousers)</label>
                <input
                  type="number"
                  step="0.25"
                  value={inseam}
                  onChange={(e) => setInseam(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Outseam</label>
                <input
                  type="number"
                  step="0.25"
                  value={outseam}
                  onChange={(e) => setOutseam(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Schedule, Pricing & Deposit */}
          <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 uppercase tracking-wider block">4. Schedule & Financials</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">1st Fitting Date</label>
                <input
                  type="date"
                  value={targetFittingDate}
                  onChange={(e) => setTargetFittingDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Final Release Due Date *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-semibold text-rose-700"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                >
                  <option value="normal">Standard Turnaround</option>
                  <option value="rush">Rush / Expedited (+ Priority)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 mb-1">Total Price ({settings.currency}) *</label>
                <input
                  type="number"
                  required
                  step="100"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Initial Deposit ({settings.currency})</label>
                <input
                  type="number"
                  step="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-emerald-700 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Maya">Maya</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Receipt / Ref #</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. OR-5582"
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors shadow-sm"
            >
              Save & Generate Job Order Slip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
