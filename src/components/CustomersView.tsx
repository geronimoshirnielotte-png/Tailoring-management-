import React, { useState } from 'react';
import { Customer, MeasurementSet, ShopSettings } from '../types';
import { convertMeasurements } from '../utils/storage';
import { Search, Plus, User, Phone, Mail, MapPin, Calendar, Ruler, History, Edit2, ShieldAlert } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  settings: ShopSettings;
  onSaveCustomer: (customer: Customer) => void;
  onOpenNewCustomerModal: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  settings,
  onSaveCustomer,
  onOpenNewCustomerModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [measurementUnit, setMeasurementUnit] = useState<'inches' | 'cm'>('inches');
  const [showEditMeasurements, setShowEditMeasurements] = useState(false);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const filteredCustomers = customers.filter((c) => {
    return (
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const latestMeasRaw = activeCustomer?.measurementsHistory?.[activeCustomer.measurementsHistory.length - 1];
  const latestMeas = latestMeasRaw ? convertMeasurements(latestMeasRaw, measurementUnit) : null;

  // New measurement revision form state
  const [newMeasNotes, setNewMeasNotes] = useState('');
  const [editValues, setEditValues] = useState<Record<string, number | undefined>>({});

  const handleStartEdit = () => {
    if (latestMeasRaw) {
      setEditValues({
        neck: latestMeasRaw.neck,
        shoulderWidth: latestMeasRaw.shoulderWidth,
        chestBust: latestMeasRaw.chestBust,
        highBust: latestMeasRaw.highBust,
        underBust: latestMeasRaw.underBust,
        apexToApex: latestMeasRaw.apexToApex,
        shoulderToApex: latestMeasRaw.shoulderToApex,
        frontLength: latestMeasRaw.frontLength,
        backLength: latestMeasRaw.backLength,
        armhole: latestMeasRaw.armhole,
        sleeveLength: latestMeasRaw.sleeveLength,
        bicep: latestMeasRaw.bicep,
        wrist: latestMeasRaw.wrist,
        waist: latestMeasRaw.waist,
        highHip: latestMeasRaw.highHip,
        fullHip: latestMeasRaw.fullHip,
        inseam: latestMeasRaw.inseam,
        outseam: latestMeasRaw.outseam,
        crotch: latestMeasRaw.crotch,
        thigh: latestMeasRaw.thigh,
        knee: latestMeasRaw.knee,
        bottomHem: latestMeasRaw.bottomHem,
        skirtLength: latestMeasRaw.skirtLength,
      });
    }
    setShowEditMeasurements(true);
  };

  const handleSaveRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;

    const newRevision: MeasurementSet = {
      id: `meas-${Date.now()}`,
      customerId: activeCustomer.id,
      date: new Date().toISOString().slice(0, 10),
      unit: 'inches',
      notes: newMeasNotes || 'Measurement profile updated',
      neck: editValues.neck,
      shoulderWidth: editValues.shoulderWidth,
      chestBust: editValues.chestBust,
      highBust: editValues.highBust,
      underBust: editValues.underBust,
      apexToApex: editValues.apexToApex,
      shoulderToApex: editValues.shoulderToApex,
      frontLength: editValues.frontLength,
      backLength: editValues.backLength,
      armhole: editValues.armhole,
      sleeveLength: editValues.sleeveLength,
      bicep: editValues.bicep,
      wrist: editValues.wrist,
      waist: editValues.waist,
      highHip: editValues.highHip,
      fullHip: editValues.fullHip,
      inseam: editValues.inseam,
      outseam: editValues.outseam,
      crotch: editValues.crotch,
      thigh: editValues.thigh,
      knee: editValues.knee,
      bottomHem: editValues.bottomHem,
      skirtLength: editValues.skirtLength,
    };

    const updatedCust: Customer = {
      ...activeCustomer,
      measurementsHistory: [...activeCustomer.measurementsHistory, newRevision],
    };

    onSaveCustomer(updatedCust);
    setShowEditMeasurements(false);
    setNewMeasNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Customer Directory & Centralized Measurement Records
          </h1>
          <p className="text-xs text-slate-500">
            Secure client profiles and anatomical measurements repository. Prevents lost notebook records and avoids unnecessary re-measuring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewCustomerModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Main Split: Customer List on Left, Active Customer & Measurements on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client List & Search */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
              />
            </div>

            <div className="text-[11px] text-slate-400 font-medium px-1">
              Registered Clients ({filteredCustomers.length})
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No customers found</div>
              ) : (
                filteredCustomers.map((cust) => {
                  const isSelected = cust.id === activeCustomer?.id;
                  const latestDate = cust.measurementsHistory[cust.measurementsHistory.length - 1]?.date;
                  return (
                    <button
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomerId(cust.id);
                        setShowEditMeasurements(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{cust.fullName}</span>
                        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cust.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>{cust.phone}</span>
                        <span className="text-[10px] text-slate-400">{cust.measurementsHistory.length} record(s)</span>
                      </div>
                      {latestDate && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Last measured: {latestDate}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details, Measurements Sheet & Anatomical Guide */}
        <div className="lg:col-span-8 space-y-6">
          {activeCustomer ? (
            <>
              {/* Customer Profile Header Card */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{activeCustomer.fullName}</h2>
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {activeCustomer.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client registered on {activeCustomer.registeredDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Unit toggle (Inches vs CM) */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
                      <button
                        onClick={() => setMeasurementUnit('inches')}
                        className={`px-3 py-1 rounded transition-colors ${
                          measurementUnit === 'inches' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                        }`}
                      >
                        Inches (")
                      </button>
                      <button
                        onClick={() => setMeasurementUnit('cm')}
                        className={`px-3 py-1 rounded transition-colors ${
                          measurementUnit === 'cm' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                        }`}
                      >
                        Centimeters (cm)
                      </button>
                    </div>

                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Update Measurements</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{activeCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{activeCustomer.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{activeCustomer.address}</span>
                  </div>
                </div>

                {activeCustomer.notes && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700">
                    <strong className="text-slate-900">Style & Posture Notes:</strong> {activeCustomer.notes}
                  </div>
                )}
              </div>

              {/* Edit / New Measurement Revision Form */}
              {showEditMeasurements && (
                <div className="p-6 bg-amber-50/40 border border-amber-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-amber-950">Record New Measurement Revision</h3>
                      <p className="text-xs text-amber-800">
                        Saves an updated measurement entry with today's date while preserving historical fits.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEditMeasurements(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveRevision} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Reason for Adjustment / Notes</label>
                      <input
                        type="text"
                        value={newMeasNotes}
                        onChange={(e) => setNewMeasNotes(e.target.value)}
                        placeholder="e.g. Waist let out by 1 inch for upcoming Barong order"
                        className="w-full p-2 bg-white border border-slate-300 rounded"
                      />
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Upper Body Dimensions (Inches)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['chestBust', 'waist', 'shoulderWidth', 'sleeveLength', 'neck', 'frontLength', 'backLength', 'armhole'].map(
                          (field) => (
                            <div key={field}>
                              <label className="block text-slate-500 text-[11px] capitalize mb-1">
                                {field.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <input
                                type="number"
                                step="0.25"
                                value={editValues[field] ?? ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [field]: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-amber-200/60">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Lower Body Dimensions (Inches)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['fullHip', 'inseam', 'outseam', 'crotch', 'thigh', 'knee', 'bottomHem', 'skirtLength'].map(
                          (field) => (
                            <div key={field}>
                              <label className="block text-slate-500 text-[11px] capitalize mb-1">
                                {field.replace(/([A-Z])/g, ' $1')}
                              </label>
                              <input
                                type="number"
                                step="0.25"
                                value={editValues[field] ?? ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [field]: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowEditMeasurements(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg shadow-2xs"
                      >
                        Save Measurement Revision
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Centralized Measurement Sheet */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-amber-800" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Active Measurement Profile ({measurementUnit.toUpperCase()})
                    </h3>
                  </div>
                  {latestMeas && (
                    <span className="text-xs text-slate-500">
                      Recorded on <strong>{latestMeas.date}</strong>
                    </span>
                  )}
                </div>

                {!latestMeas ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No measurements recorded yet for this client. Click "Update Measurements" to record points.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upper Body Section */}
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                        Upper Body & Torso
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Chest / Bust', val: latestMeas.chestBust },
                          { label: 'Waist', val: latestMeas.waist },
                          { label: 'Shoulder Width', val: latestMeas.shoulderWidth },
                          { label: 'Sleeve Length', val: latestMeas.sleeveLength },
                          { label: 'Neck Circumference', val: latestMeas.neck },
                          { label: 'Front Length', val: latestMeas.frontLength },
                          { label: 'Back Length', val: latestMeas.backLength },
                          { label: 'Armhole', val: latestMeas.armhole },
                          { label: 'Bicep', val: latestMeas.bicep },
                          { label: 'Wrist', val: latestMeas.wrist },
                          { label: 'High Bust', val: latestMeas.highBust },
                          { label: 'Under Bust', val: latestMeas.underBust },
                        ]
                          .filter((item) => item.val !== undefined)
                          .map((item) => (
                            <div key={item.label} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                              <span className="text-[11px] text-slate-400 block">{item.label}</span>
                              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                                {item.val} {measurementUnit === 'inches' ? '"' : 'cm'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Lower Body Section */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                        Lower Body & Trousers / Skirt
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: 'Full Hip', val: latestMeas.fullHip },
                          { label: 'High Hip', val: latestMeas.highHip },
                          { label: 'Inseam', val: latestMeas.inseam },
                          { label: 'Outseam', val: latestMeas.outseam },
                          { label: 'Crotch / Rise', val: latestMeas.crotch },
                          { label: 'Thigh', val: latestMeas.thigh },
                          { label: 'Knee', val: latestMeas.knee },
                          { label: 'Bottom Hem', val: latestMeas.bottomHem },
                          { label: 'Skirt Length', val: latestMeas.skirtLength },
                        ]
                          .filter((item) => item.val !== undefined)
                          .map((item) => (
                            <div key={item.label} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                              <span className="text-[11px] text-slate-400 block">{item.label}</span>
                              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                                {item.val} {measurementUnit === 'inches' ? '"' : 'cm'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Anatomical Reference Diagram Card */}
                    <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg text-xs space-y-2">
                      <span className="font-bold text-slate-900 block">Master Tailor Measuring Protocol Guide</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                        <div>
                          <strong>Chest/Bust:</strong> Pass tape measure under armpits across the fullest part of chest with tape level to floor.
                        </div>
                        <div>
                          <strong>Waistline:</strong> Measure around the natural waist (above belly button), keeping 1 finger ease under the tape.
                        </div>
                        <div>
                          <strong>Inseam & Outseam:</strong> From crotch seam to bottom heel hem (inseam); from waistline to ankle hem (outseam).
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Historical Revisions Log (Direct solution to Problem #1: Retrieving & Updating customer measurements) */}
              <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Measurement Version History ({activeCustomer.measurementsHistory.length} Revisions)
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {activeCustomer.measurementsHistory.map((m, idx) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">Revision #{idx + 1} ({m.date})</span>
                        {m.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{m.notes}</p>}
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-600">
                        Chest: {m.chestBust}" · Waist: {m.waist}" · Outseam: {m.outseam}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
              Select a customer to view their body measurement sheet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
