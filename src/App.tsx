/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, Order, OrderStatus, PaymentRecord, ShopSettings } from './types';
import { loadCustomers, saveCustomers, loadOrders, saveOrders, loadShopSettings, saveShopSettings } from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { TailorToolsView } from './components/TailorToolsView';
import { ResearchThesisView } from './components/ResearchThesisView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { OrderFormModal } from './components/OrderFormModal';
import { CustomerFormModal } from './components/CustomerFormModal';
import { PrintClaimStubModal } from './components/PrintClaimStubModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'orders' | 'customers' | 'tools' | 'research'>('dashboard');
  
  // Storage state
  const [customers, setCustomers] = useState<Customer[]>(() => loadCustomers());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [settings, setSettings] = useState<ShopSettings>(() => loadShopSettings());

  // Modal states
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // Sync state to local storage
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    saveOrders(updated);
    if (selectedOrderForDetail?.id === orderId) {
      setSelectedOrderForDetail({ ...selectedOrderForDetail, status: newStatus });
    }
  };

  const handleAddPayment = (orderId: string, paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
    };
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          payments: [...o.payments, newPayment],
        };
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
    if (selectedOrderForDetail?.id === orderId) {
      setSelectedOrderForDetail({
        ...selectedOrderForDetail,
        payments: [...selectedOrderForDetail.payments, newPayment],
      });
    }
  };

  const handleCreateOrder = (newOrder: Order, newCustomer?: Customer) => {
    if (newCustomer) {
      const updatedCusts = [newCustomer, ...customers];
      setCustomers(updatedCusts);
      saveCustomers(updatedCusts);
    }
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    setShowNewOrderModal(false);
    // Open print preview automatically for the new order!
    setSelectedOrderForPrint(newOrder);
  };

  const handleSaveCustomer = (updatedCust: Customer) => {
    const exists = customers.some((c) => c.id === updatedCust.id);
    let nextCusts: Customer[];
    if (exists) {
      nextCusts = customers.map((c) => (c.id === updatedCust.id ? updatedCust : c));
    } else {
      nextCusts = [updatedCust, ...customers];
    }
    setCustomers(nextCusts);
    saveCustomers(nextCusts);
  };

  const handleUpdateSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    saveShopSettings(newSettings);
  };

  const handleDataReset = () => {
    setCustomers(loadCustomers());
    setOrders(loadOrders());
    setSettings(loadShopSettings());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewOrder={() => setShowNewOrderModal(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            customers={customers}
            settings={settings}
            onNavigate={setCurrentTab}
            onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
            onOpenNewOrder={() => setShowNewOrderModal(true)}
            onOpenNewCustomer={() => setShowNewCustomerModal(true)}
            onPrintOrder={(ord) => setSelectedOrderForPrint(ord)}
          />
        )}

        {currentTab === 'orders' && (
          <OrdersView
            orders={orders}
            settings={settings}
            onSelectOrder={(ord) => setSelectedOrderForDetail(ord)}
            onPrintOrder={(ord) => setSelectedOrderForPrint(ord)}
            onOpenNewOrder={() => setShowNewOrderModal(true)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            customers={customers}
            settings={settings}
            onSaveCustomer={handleSaveCustomer}
            onOpenNewCustomerModal={() => setShowNewCustomerModal(true)}
          />
        )}

        {currentTab === 'tools' && (
          <TailorToolsView
            orders={orders}
            customers={customers}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReset={handleDataReset}
          />
        )}

        {currentTab === 'research' && (
          <ResearchThesisView onNavigateTab={setCurrentTab} />
        )}
      </main>

      {/* Modals */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          settings={settings}
          onClose={() => setSelectedOrderForDetail(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddPayment={handleAddPayment}
          onPrint={(ord) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForPrint(ord);
          }}
        />
      )}

      {selectedOrderForPrint && (
        <PrintClaimStubModal
          order={selectedOrderForPrint}
          settings={settings}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}

      {showNewOrderModal && (
        <OrderFormModal
          customers={customers}
          settings={settings}
          onClose={() => setShowNewOrderModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {showNewCustomerModal && (
        <CustomerFormModal
          onClose={() => setShowNewCustomerModal(false)}
          onSave={handleSaveCustomer}
        />
      )}

      {/* Quiet, Clean Institutional Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">TailorCraft</span>
            <span aria-hidden="true">·</span>
            <span>Customer Order & Measurements Management System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => setCurrentTab('research')} className="hover:text-amber-800 transition-colors">
              Thesis Documentation & Research Objectives
            </button>
            <span aria-hidden="true">·</span>
            <button onClick={() => setCurrentTab('tools')} className="hover:text-amber-800 transition-colors">
              Data Security & JSON Backup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
