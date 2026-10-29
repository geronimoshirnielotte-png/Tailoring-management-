import React from 'react';
import { Customer, Order, ShopSettings } from '../types';
import { formatCurrency, getOrderPaymentSummary } from '../utils/storage';
import { Clock, Scissors, CheckCircle, AlertTriangle, Printer, ArrowRight, UserPlus, FileText } from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  customers: Customer[];
  settings: ShopSettings;
  onNavigate: (tab: 'dashboard' | 'orders' | 'customers' | 'tools' | 'research') => void;
  onSelectOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
  onOpenNewCustomer: () => void;
  onPrintOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  customers,
  settings,
  onNavigate,
  onSelectOrder,
  onOpenNewOrder,
  onOpenNewCustomer,
  onPrintOrder,
}) => {
  // Compute metrics
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const rushOrders = orders.filter((o) => o.priority === 'rush' && o.status !== 'completed' && o.status !== 'cancelled');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  
  const totalReceivables = activeOrders.reduce((sum, order) => {
    const { balance } = getOrderPaymentSummary(order);
    return sum + balance;
  }, 0);

  // Status distribution
  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    cutting: orders.filter((o) => o.status === 'cutting').length,
    fitting: orders.filter((o) => o.status === 'fitting').length,
    finishing: orders.filter((o) => o.status === 'finishing').length,
    ready: readyOrders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  // Urgent upcoming deadlines
  const sortedUpcoming = [...activeOrders].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Atelier Banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[260px]">
          <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                <span>{settings.shopName}</span>
                <span aria-hidden="true">·</span>
                <span>Production Operations</span>
                <span aria-hidden="true">·</span>
                <span>Role: {settings.activeRole === 'master_tailor' ? 'Master Tailor' : 'Assistant Cutter'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                Customer Order and Measurements Management System
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                Centralized digital platform replacing paper notebooks and index cards. Track bespoke orders, preserve body measurements, monitor deadlines, and maintain financial records with zero lost data.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenNewOrder}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
              >
                <span>+ Create Garment Order</span>
              </button>
              <button
                onClick={onOpenNewCustomer}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Customer Profile</span>
              </button>
              <button
                onClick={() => onNavigate('research')}
                className="px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Research Study & Objectives</span>
              </button>
            </div>
          </div>

          <div className="relative lg:col-span-5 h-56 lg:h-auto overflow-hidden bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200">
            <img
              src="/src/assets/images/atelier_tailor_workshop_1793279565070.jpg"
              alt="Bespoke atelier workshop cutting table"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-white/90 font-medium drop-shadow-sm flex items-center justify-between">
              <span>Bespoke Cutting Room & Fitting Bench</span>
              <span className="tabular-nums">{activeOrders.length} In-Progress Garments</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Work in Progress</span>
            <Scissors className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {activeOrders.length}
          </div>
          <div className="text-xs text-slate-500">
            <span>Across {customers.length} registered clients</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rush & Priority Orders</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-900 tabular-nums">
            {rushOrders.length}
          </div>
          <div className="text-xs text-slate-500">
            <span>Expedited cutting & 1st fitting</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Ready for Pickup / Claim</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {readyOrders.length}
          </div>
          <div className="text-xs text-slate-500">
            <span>Customer claim stubs issued</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Balance Receivables</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalReceivables, settings.currency)}
          </div>
          <div className="text-xs text-slate-500">
            <span>To be collected upon garment release</span>
          </div>
        </div>
      </div>

      {/* Production Pipeline Progress Tracker */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Garment Production Pipeline</h2>
            <p className="text-xs text-slate-500">Real-time status tracking from cloth cutting to completion</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            <span>View Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-xs text-slate-500 block">01. Pending / Quote</span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">{statusCounts.pending}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-xs text-slate-500 block">02. Cutting & Prep</span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">{statusCounts.cutting}</span>
          </div>
          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg">
            <span className="text-xs text-amber-900 font-medium block">03. Basting / Fitting</span>
            <span className="text-lg font-bold text-amber-900 tabular-nums">{statusCounts.fitting}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-xs text-slate-500 block">04. Final Sewing</span>
            <span className="text-lg font-bold text-slate-800 tabular-nums">{statusCounts.finishing}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-lg">
            <span className="text-xs text-emerald-900 font-medium block">05. Ready for Claim</span>
            <span className="text-lg font-bold text-emerald-900 tabular-nums">{statusCounts.ready}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="text-xs text-slate-500 block">06. Completed</span>
            <span className="text-lg font-bold text-slate-600 tabular-nums">{statusCounts.completed}</span>
          </div>
        </div>
      </div>

      {/* Two Column Split: Upcoming Deadlines & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Urgent Deadlines & Fitting Schedule (Solves Specific Problem #2) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Priority Deadlines & Fittings</h3>
              <span className="text-xs text-slate-400">Next Due</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Addresses shop monitoring challenges by surfacing approaching due dates and fitting schedules before missed deadlines occur.
            </p>

            <div className="divide-y divide-slate-100">
              {sortedUpcoming.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending deadlines. All current orders are fulfilled!
                </div>
              ) : (
                sortedUpcoming.map((order) => {
                  const { balance, paymentStatus } = getOrderPaymentSummary(order);
                  return (
                    <div
                      key={order.id}
                      className="py-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-900">{order.orderNumber}</span>
                          {order.priority === 'rush' && (
                            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">RUSH</span>
                          )}
                          <span className="text-xs text-slate-500 truncate">{order.garmentType}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 truncate">{order.customerName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Due: <strong className="font-semibold text-slate-700">{order.dueDate}</strong></span>
                          {order.targetFittingDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Fitting: {order.targetFittingDate}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(order.totalAmount, settings.currency)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {balance > 0 ? (
                            <span className="text-amber-700 font-medium">Bal: {formatCurrency(balance, settings.currency)}</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Fully Paid</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Craft Tools Showcase Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/tailoring_craft_tools_1793279558927.jpg"
                alt="Artisan tailoring tools"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Tailor Utility Suite</h4>
                <p className="text-xs text-slate-500">Yardage estimator, client SMS generator, and JSON backup</p>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => onNavigate('tools')}
                className="w-full py-2 text-xs font-medium text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-center"
              >
                Launch Tailor Tools & Estimator
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Recent Orders Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Active Production Orders</h3>
                <p className="text-xs text-slate-500">Quick management, customer claim stubs, and receipt slips</p>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-medium text-amber-800 hover:text-amber-900"
              >
                View All ({orders.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-2.5 font-normal">Order #</th>
                    <th className="pb-2.5 font-normal">Client & Garment</th>
                    <th className="pb-2.5 font-normal">Status</th>
                    <th className="pb-2.5 font-normal text-right">Balance</th>
                    <th className="pb-2.5 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 6).map((order) => {
                    const { balance, paymentStatus } = getOrderPaymentSummary(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-mono font-medium text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-slate-800">{order.customerName}</div>
                          <div className="text-slate-500 truncate max-w-[170px]">{order.garmentType}</div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              order.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : order.status === 'ready'
                                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                                : order.status === 'fitting'
                                ? 'bg-amber-50 text-amber-800 font-semibold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right tabular-nums">
                          {balance > 0 ? (
                            <span className="text-slate-900 font-medium">{formatCurrency(balance, settings.currency)}</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Paid</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPrintOrder(order)}
                              title="Print Job Order & Claim Stub"
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
