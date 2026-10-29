import React, { useState } from 'react';
import { Customer, MeasurementSet } from '../types';
import { X, UserPlus, Ruler } from 'lucide-react';

interface CustomerFormModalProps {
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ onClose, onSave }) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Initial measurements
  const [chestBust, setChestBust] = useState('');
  const [waist, setWaist] = useState('');
  const [fullHip, setFullHip] = useState('');
  const [shoulderWidth, setShoulderWidth] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [neck, setNeck] = useState('');
  const [frontLength, setFrontLength] = useState('');
  const [inseam, setInseam] = useState('');
  const [outseam, setOutseam] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const custId = `cust-${Date.now()}`;
    const initialMeas: MeasurementSet = {
      id: `meas-${Date.now()}`,
      customerId: custId,
      date: todayStr,
      unit: 'inches',
      notes: 'Initial registration measurements',
      chestBust: chestBust ? parseFloat(chestBust) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      fullHip: fullHip ? parseFloat(fullHip) : undefined,
      shoulderWidth: shoulderWidth ? parseFloat(shoulderWidth) : undefined,
      sleeveLength: sleeveLength ? parseFloat(sleeveLength) : undefined,
      neck: neck ? parseFloat(neck) : undefined,
      frontLength: frontLength ? parseFloat(frontLength) : undefined,
      inseam: inseam ? parseFloat(inseam) : undefined,
      outseam: outseam ? parseFloat(outseam) : undefined,
    };

    const newCustomer: Customer = {
      id: custId,
      code: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      gender,
      phone: phone.trim() || 'N/A',
      email: email.trim() || '',
      address: address.trim() || 'N/A',
      notes: notes.trim() || '',
      registeredDate: todayStr,
      measurementsHistory: [initialMeas],
    };

    onSave(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-6">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold">Register New Customer & Measurements</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          {/* Personal Information */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wider block">1. Personal Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Atty. Fernando Ocampo"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Residential / Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, Postal Code"
                className="w-full p-2 bg-white border border-slate-300 rounded"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Tailoring Notes & Fit Preferences</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sloping shoulders, prefers loose Barong fit"
                className="w-full p-2 bg-white border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Initial Body Measurements */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                2. Initial Measurements (Inches)
              </span>
              <span className="text-slate-400">Can be updated anytime later</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Chest / Bust</label>
                <input
                  type="number"
                  step="0.25"
                  value={chestBust}
                  onChange={(e) => setChestBust(e.target.value)}
                  placeholder='e.g. 38"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Waist</label>
                <input
                  type="number"
                  step="0.25"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder='e.g. 32"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Hips</label>
                <input
                  type="number"
                  step="0.25"
                  value={fullHip}
                  onChange={(e) => setFullHip(e.target.value)}
                  placeholder='e.g. 39"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Shoulder Width</label>
                <input
                  type="number"
                  step="0.25"
                  value={shoulderWidth}
                  onChange={(e) => setShoulderWidth(e.target.value)}
                  placeholder='e.g. 17.5"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Sleeve Length</label>
                <input
                  type="number"
                  step="0.25"
                  value={sleeveLength}
                  onChange={(e) => setSleeveLength(e.target.value)}
                  placeholder='e.g. 24.5"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Neck</label>
                <input
                  type="number"
                  step="0.25"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  placeholder='e.g. 15.5"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Front Length</label>
                <input
                  type="number"
                  step="0.25"
                  value={frontLength}
                  onChange={(e) => setFrontLength(e.target.value)}
                  placeholder='e.g. 29"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Inseam</label>
                <input
                  type="number"
                  step="0.25"
                  value={inseam}
                  onChange={(e) => setInseam(e.target.value)}
                  placeholder='e.g. 30.5"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Outseam</label>
                <input
                  type="number"
                  step="0.25"
                  value={outseam}
                  onChange={(e) => setOutseam(e.target.value)}
                  placeholder='e.g. 40.5"'
                  className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs"
            >
              Save Customer Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
