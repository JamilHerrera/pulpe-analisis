import { ShoppingCart, BarChart3, ClipboardList } from 'lucide-react';

interface NavigationProps {
  currentView: 'ventas' | 'semáforo' | 'pedidos';
  onViewChange: (view: 'ventas' | 'semáforo' | 'pedidos') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-2xl shadow-slate-200 z-50">
      <div className="flex justify-around py-2">
        <button
          onClick={() => onViewChange('ventas')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'ventas'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart size={22} />
          <span className="text-xs font-semibold">Ventas</span>
        </button>
        <button
          onClick={() => onViewChange('semáforo')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'semáforo'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={22} />
          <span className="text-xs font-semibold">Semáforo</span>
        </button>
        <button
          onClick={() => onViewChange('pedidos')}
          className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'pedidos'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ClipboardList size={22} />
          <span className="text-xs font-semibold">Pedidos</span>
        </button>
      </div>
    </nav>
  );
}
