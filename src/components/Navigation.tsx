import { ShoppingCart, BarChart3, ClipboardList } from 'lucide-react';

interface NavigationProps {
  currentView: 'ventas' | 'semáforo' | 'pedidos';
  onViewChange: (view: 'ventas' | 'semáforo' | 'pedidos') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around py-3">
        <button
          onClick={() => onViewChange('ventas')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'ventas' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart size={24} />
          <span className="text-xs font-medium">Ventas</span>
        </button>
        <button
          onClick={() => onViewChange('semáforo')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'semáforo' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 size={24} />
          <span className="text-xs font-medium">Semáforo</span>
        </button>
        <button
          onClick={() => onViewChange('pedidos')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            currentView === 'pedidos' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={24} />
          <span className="text-xs font-medium">Pedidos</span>
        </button>
      </div>
    </nav>
  );
}
