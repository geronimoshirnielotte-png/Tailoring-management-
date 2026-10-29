import React from 'react';

interface NavbarProps {
  currentTab: 'dashboard' | 'orders' | 'customers' | 'tools' | 'research';
  onSelectTab: (tab: 'dashboard' | 'orders' | 'customers' | 'tools' | 'research') => void;
  onOpenNewOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenNewOrder }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-amber-800 transition-colors text-left"
        >
          TailorCraft
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'dashboard'
                ? 'border-amber-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'orders'
                ? 'border-amber-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Orders & Tracking
          </button>
          <button
            onClick={() => onSelectTab('customers')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'customers'
                ? 'border-amber-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Customers & Measurements
          </button>
          <button
            onClick={() => onSelectTab('tools')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'tools'
                ? 'border-amber-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Tailor Tools & Backup
          </button>
          <button
            onClick={() => onSelectTab('research')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              currentTab === 'research'
                ? 'border-amber-700 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Research Study
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition-colors whitespace-nowrap shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer strip */}
      <div className="md:hidden flex overflow-x-auto gap-4 px-4 py-2 border-t border-slate-100 text-xs font-medium text-slate-600 no-scrollbar">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap px-2 py-1 ${currentTab === 'dashboard' ? 'text-amber-800 font-bold border-b border-amber-800' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('orders')}
          className={`whitespace-nowrap px-2 py-1 ${currentTab === 'orders' ? 'text-amber-800 font-bold border-b border-amber-800' : ''}`}
        >
          Orders
        </button>
        <button
          onClick={() => onSelectTab('customers')}
          className={`whitespace-nowrap px-2 py-1 ${currentTab === 'customers' ? 'text-amber-800 font-bold border-b border-amber-800' : ''}`}
        >
          Customers
        </button>
        <button
          onClick={() => onSelectTab('tools')}
          className={`whitespace-nowrap px-2 py-1 ${currentTab === 'tools' ? 'text-amber-800 font-bold border-b border-amber-800' : ''}`}
        >
          Tools
        </button>
        <button
          onClick={() => onSelectTab('research')}
          className={`whitespace-nowrap px-2 py-1 ${currentTab === 'research' ? 'text-amber-800 font-bold border-b border-amber-800' : ''}`}
        >
          Research Study
        </button>
      </div>
    </header>
  );
};
