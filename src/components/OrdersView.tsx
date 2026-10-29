import React, { useState } from 'react';
import { GarmentCategory, Order, OrderStatus, ShopSettings } from '../types';
import { formatCurrency, getOrderPaymentSummary } from '../utils/storage';
import { Search, Filter, Printer, Eye, ChevronRight, LayoutGrid, List, AlertCircle, Plus } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  settings: ShopSettings;
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  settings,
  onSelectOrder,
  onPrintOrder,
  onOpenNewOrder,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [garmentFilter, setGarmentFilter] = useState<string>('all');
  const [rushOnly, setRushOnly] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.garmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.fabricDetails?.fabricType || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesGarment = garmentFilter === 'all' || order.garmentType === garmentFilter;
    const matchesRush = !rushOnly || order.priority === 'rush';

    return matchesSearch && matchesStatus && matchesGarment && matchesRush;
  });

  const columns: { status: OrderStatus; title: string; count: number }[] = [
    { status: 'pending', title: 'Pending / Quote', count: orders.filter((o) => o.status === 'pending').length },
    { status: 'cutting', title: 'Cutting & Prep', count: orders.filter((o) => o.status === 'cutting').length },
    { status: 'fitting', title: 'Basting / Fitting', count: orders.filter((o) => o.status === 'fitting').length },
    { status: 'finishing', title: 'Final Sewing', count: orders.filter((o) => o.status === 'finishing').length },
    { status: 'ready', title: 'Ready for Pickup', count: orders.filter((o) => o.status === 'ready').length },
    { status: 'completed', title: 'Completed', count: orders.filter((o) => o.status === 'completed').length },
  ];

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const sequence: OrderStatus[] = ['pending', 'cutting', 'fitting', 'finishing', 'ready', 'completed'];
    const idx = sequence.indexOf(current);
    if (idx >= 0 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls & Filter Bar */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Garment Orders & Production Pipeline</h1>
            <p className="text-xs text-slate-500">Monitor status, stage progress, due dates, and client balance collections</p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Segmented Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Data Table</span>
              </button>
            </div>

            <button
              onClick={onOpenNewOrder}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, order #, garment or fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-800"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-800"
            >
              <option value="all">All Stages ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="cutting">Cutting & Prep</option>
              <option value="fitting">Basting / Fitting</option>
              <option value="finishing">Final Sewing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={garmentFilter}
              onChange={(e) => setGarmentFilter(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-800"
            >
              <option value="all">All Garments</option>
              <option value="Barong Tagalog">Barong Tagalog</option>
              <option value="Filipiniana / Terno">Filipiniana / Terno</option>
              <option value="Business Suit / Blazer">Business Suit</option>
              <option value="Slacks / Trousers">Slacks</option>
              <option value="Evening Gown">Evening Gown</option>
              <option value="School / Office Uniform">Uniforms</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rushOnly}
                onChange={(e) => setRushOnly(e.target.checked)}
                className="rounded border-slate-300 text-amber-800 focus:ring-amber-800"
              />
              <span className="font-medium text-rose-700">Rush Priority Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 space-y-3 min-w-[240px]"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
                  <span className="text-xs font-bold text-slate-800">{col.title}</span>
                  <span className="text-xs font-semibold font-mono text-slate-500 bg-white px-2 py-0.5 rounded shadow-2xs">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colOrders.length === 0 ? (
                    <div className="py-6 text-center text-[11px] text-slate-400 italic">
                      No garments in this stage
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const { balance, paymentStatus } = getOrderPaymentSummary(order);
                      const nextStatus = getNextStatus(order.status);

                      return (
                        <div
                          key={order.id}
                          className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <span className="font-mono text-xs font-bold text-slate-900 block">
                                {order.orderNumber}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 block truncate max-w-[160px]">
                                {order.customerName}
                              </span>
                            </div>
                            {order.priority === 'rush' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded shrink-0">
                                RUSH
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500">
                            <span className="text-slate-700 font-medium">{order.garmentType}</span>
                            <p className="text-[11px] text-slate-400 truncate">{order.fabricDetails?.colorPattern}</p>
                          </div>

                          <div className="pt-1 text-[11px] flex items-center justify-between border-t border-slate-100 text-slate-500">
                            <span>Due: <strong className="font-semibold text-slate-700">{order.dueDate}</strong></span>
                            <span className="font-mono tabular-nums text-slate-900 font-semibold">
                              {formatCurrency(order.totalAmount, settings.currency)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            {balance > 0 ? (
                              <span className="text-amber-800 font-medium">Bal: {formatCurrency(balance, settings.currency)}</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Fully Paid</span>
                            )}

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onPrintOrder(order)}
                                title="Print Slip"
                                className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onSelectOrder(order)}
                                className="px-2 py-0.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          </div>

                          {/* Quick advance status */}
                          {nextStatus && (
                            <button
                              onClick={() => onUpdateStatus(order.id, nextStatus)}
                              className="w-full py-1 text-[11px] font-medium text-amber-900 bg-amber-50 hover:bg-amber-100/80 rounded transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Advance to {nextStatus.toUpperCase()}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DATA GRID TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-3 px-4 font-normal">Order #</th>
                  <th className="py-3 px-4 font-normal">Customer</th>
                  <th className="py-3 px-4 font-normal">Garment & Fabric</th>
                  <th className="py-3 px-4 font-normal">Dates (Order / Fitting / Due)</th>
                  <th className="py-3 px-4 font-normal">Stage</th>
                  <th className="py-3 px-4 font-normal text-right">Price</th>
                  <th className="py-3 px-4 font-normal text-right">Balance</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      No orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const { balance, paymentStatus } = getOrderPaymentSummary(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{order.orderNumber}</span>
                            {order.priority === 'rush' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded">
                                RUSH
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{order.customerName}</div>
                          <div className="text-slate-500 text-[11px]">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{order.garmentType}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{order.fabricDetails.fabricType}</div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-600">
                          <div>Placed: {order.orderDate}</div>
                          <div>Due: <strong className="text-rose-700 font-semibold">{order.dueDate}</strong></div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
                              order.status === 'completed'
                                ? 'bg-slate-100 text-slate-700'
                                : order.status === 'ready'
                                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                                : order.status === 'fitting'
                                ? 'bg-amber-50 text-amber-800 font-semibold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(order.totalAmount, settings.currency)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {balance > 0 ? (
                            <span className="text-amber-800 font-bold">{formatCurrency(balance, settings.currency)}</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Paid</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPrintOrder(order)}
                              title="Print Job Order & Claim Stub"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onSelectOrder(order)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
