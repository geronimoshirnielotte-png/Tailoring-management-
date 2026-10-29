import { Customer, Order, ShopSettings, EvaluationResponse, MeasurementSet } from '../types';
import { initialCustomers, initialOrders, initialShopSettings, initialEvaluations } from '../data/seedData';

const STORAGE_KEYS = {
  CUSTOMERS: 'tailorcraft_customers_v1',
  ORDERS: 'tailorcraft_orders_v1',
  SETTINGS: 'tailorcraft_settings_v1',
  EVALUATIONS: 'tailorcraft_evaluations_v1',
};

export function loadCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      saveCustomers(initialCustomers);
      return initialCustomers;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading customers from storage:', err);
    return initialCustomers;
  }
}

export function saveCustomers(customers: Customer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (err) {
    console.error('Error saving customers to storage:', err);
  }
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      saveOrders(initialOrders);
      return initialOrders;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading orders from storage:', err);
    return initialOrders;
  }
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving orders to storage:', err);
  }
}

export function loadShopSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveShopSettings(initialShopSettings);
      return initialShopSettings;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading shop settings:', err);
    return initialShopSettings;
  }
}

export function saveShopSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving shop settings:', err);
  }
}

export function loadEvaluations(): EvaluationResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (!raw) {
      saveEvaluations(initialEvaluations);
      return initialEvaluations;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading evaluations:', err);
    return initialEvaluations;
  }
}

export function saveEvaluations(evals: EvaluationResponse[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evals));
  } catch (err) {
    console.error('Error saving evaluations:', err);
  }
}

export function exportFullDatabaseBackup(): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    system: 'TailorCraft - Customer Order and Measurements Management System',
    version: '1.0.0',
    customers: loadCustomers(),
    orders: loadOrders(),
    settings: loadShopSettings(),
    evaluations: loadEvaluations(),
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateTag = new Date().toISOString().slice(0, 10);
  link.download = `tailorcraft-system-backup-${dateTag}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function restoreDatabaseBackup(jsonData: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonData);
    if (!parsed.customers || !parsed.orders) {
      return { success: false, message: 'Invalid backup format. Missing customers or orders collections.' };
    }
    if (Array.isArray(parsed.customers)) {
      saveCustomers(parsed.customers);
    }
    if (Array.isArray(parsed.orders)) {
      saveOrders(parsed.orders);
    }
    if (parsed.settings) {
      saveShopSettings(parsed.settings);
    }
    if (Array.isArray(parsed.evaluations)) {
      saveEvaluations(parsed.evaluations);
    }
    return { success: true, message: `Successfully restored ${parsed.customers?.length || 0} customers and ${parsed.orders?.length || 0} orders.` };
  } catch (err: any) {
    return { success: false, message: `Failed to restore backup: ${err.message || 'JSON parse error'}` };
  }
}

export function resetToSeedData(): void {
  saveCustomers(initialCustomers);
  saveOrders(initialOrders);
  saveShopSettings(initialShopSettings);
  saveEvaluations(initialEvaluations);
}

// Helper calculation functions
export function formatCurrency(amount: number, currency: string = '₱'): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getOrderPaymentSummary(order: Order): {
  totalPaid: number;
  balance: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
} {
  const totalPaid = order.payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const balance = Math.max(0, order.totalAmount - totalPaid);
  let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  if (totalPaid >= order.totalAmount && order.totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  }
  return { totalPaid, balance, paymentStatus };
}

export function convertMeasurements(meas: MeasurementSet, targetUnit: 'inches' | 'cm'): MeasurementSet {
  if (meas.unit === targetUnit) return meas;
  const factor = targetUnit === 'cm' ? 2.54 : 1 / 2.54;
  const copy: any = { ...meas, unit: targetUnit };
  
  const numericKeys = [
    'neck', 'shoulderWidth', 'chestBust', 'highBust', 'underBust', 'apexToApex',
    'shoulderToApex', 'frontLength', 'backLength', 'armhole', 'sleeveLength',
    'bicep', 'wrist', 'waist', 'highHip', 'fullHip', 'inseam', 'outseam',
    'crotch', 'thigh', 'knee', 'bottomHem', 'skirtLength'
  ];

  numericKeys.forEach((key) => {
    if (typeof copy[key] === 'number') {
      copy[key] = parseFloat((copy[key] * factor).toFixed(2));
    }
  });

  return copy;
}
