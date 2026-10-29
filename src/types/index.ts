export interface MeasurementSet {
  id: string;
  customerId: string;
  date: string;
  unit: 'inches' | 'cm';
  notes?: string;

  // Upper Body
  neck?: number;
  shoulderWidth?: number;
  chestBust?: number;
  highBust?: number;
  underBust?: number;
  apexToApex?: number;
  shoulderToApex?: number;
  frontLength?: number;
  backLength?: number;
  armhole?: number;
  sleeveLength?: number;
  bicep?: number;
  wrist?: number;

  // Lower Body
  waist?: number;
  highHip?: number;
  fullHip?: number;
  inseam?: number;
  outseam?: number;
  crotch?: number;
  thigh?: number;
  knee?: number;
  bottomHem?: number;
  skirtLength?: number;

  // Posture & Fit Preferences
  postureSlope?: 'normal' | 'sloping' | 'square';
  fitPreference?: 'tight' | 'regular' | 'loose' | 'tailored';
}

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  gender: 'male' | 'female' | 'unisex';
  phone: string;
  email: string;
  address: string;
  notes: string;
  registeredDate: string;
  measurementsHistory: MeasurementSet[];
}

export type GarmentCategory =
  | 'Barong Tagalog'
  | 'Filipiniana / Terno'
  | 'Business Suit / Blazer'
  | 'Slacks / Trousers'
  | 'Evening Gown'
  | 'School / Office Uniform'
  | 'Tailored Dress'
  | 'Polo & Shirt'
  | 'Alteration & Repair'
  | 'Custom Vest';

export type OrderStatus =
  | 'pending'
  | 'cutting'
  | 'fitting'
  | 'finishing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'GCash' | 'Bank Transfer' | 'Maya';
  referenceNumber?: string;
  notes?: string;
}

export interface FabricDetails {
  fabricType: string;
  colorPattern: string;
  suppliedBy: 'customer' | 'shop';
  yardageMeters?: number;
  liningRequired: boolean;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  garmentType: GarmentCategory;
  garmentDescription: string;
  fabricDetails: FabricDetails;
  measurementsSnapshot: MeasurementSet;
  orderDate: string;
  targetFittingDate?: string;
  dueDate: string;
  completedDate?: string;
  priority: 'normal' | 'rush';
  status: OrderStatus;
  totalAmount: number;
  payments: PaymentRecord[];
  assignedTailor: string;
  internalNotes?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  address: string;
  contactNumber: string;
  email: string;
  currency: string;
  taxRatePercent: number;
  defaultTurnaroundDays: number;
  activeRole: 'master_tailor' | 'staff_cutter';
}

export interface EvaluationResponse {
  id: string;
  evaluatorType: 'shop_owner' | 'tailor' | 'customer';
  evaluatorName: string;
  date: string;
  functionality: number; // 1-5
  usability: number;     // 1-5
  efficiency: number;    // 1-5
  accuracy: number;      // 1-5
  comments: string;
}
