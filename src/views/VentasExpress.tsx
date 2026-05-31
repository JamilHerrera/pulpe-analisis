import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, AlertCircle, DollarSign, TrendingUp, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Producto, CarritoItem } from '../types';

const PRODUCTOS_COMUNES: Producto[] = [
  { id: '1', nombre: 'Leche', precio: 1.50 },
  { id: '2', nombre: 'Refresco', precio: 2.00 },
  { id: '3', nombre: 'Pan', precio: 0.50 },
  { id: '4', nombre: 'Huevos', precio: 3.00 },
  { id: '5', nombre: 'Galletas', precio: 1.00 },
  { id: '6', nombre: 'Arroz', precio: 2.50 },
  { id: '7', nombre: 'Frijoles', precio: 2.00 },
  { id: '8', nombre: 'Azúcar', precio: 1.80 },
];

export default function VentasExpress() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [montoLibre, setMontoLibre] = useState('');
  const [cajaDiaria, setCajaDiaria] = useState(0);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [tipoAlerta, setTipoAlerta] = useState<'success' | 'error'>('success');
  const [sincronizacionPendiente, setSincronizacionPendiente] = useState(false);

  useEffect(() => {
    cargarCajaDiaria();
    verificarSincronizacionPendiente();
  }, []);

  const cargarCajaDiaria = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ventas')
        .select('total')
        .gte('fecha', hoy)
        .lt('fecha', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      if (error) throw error;
      
      const total = data?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
      setCajaDiaria(total);
    } catch (error) {
      console.error('Error al cargar caja diaria:', error);
    }
  };

  const verificarSincronizacionPendiente = () => {
    const pendiente = localStorage.getItem('ventas_pendientes');
    setSincronizacionPendiente(pendiente !== null);
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.producto.id === producto.id);
      if (existente) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const agregarMontoLibre = () => {
    const monto = parseFloat(montoLibre);
    if (isNaN(monto) || monto <= 0) {
      mostrarAlertaError('Por favor ingrese un monto válido');
      return;
    }

    const productoLibre: Producto = {
      id: 'libre-' + Date.now(),
      nombre: 'Monto Libre',
      precio: monto,
    };

    setCarrito(prev => [...prev, { producto: productoLibre, cantidad: 1 }]);
    setMontoLibre('');
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const mostrarAlertaExito = (mensaje: string) => {
    setMensajeAlerta(mensaje);
    setTipoAlerta('success');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const mostrarAlertaError = (mensaje: string) => {
    setMensajeAlerta(mensaje);
    setTipoAlerta('error');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const guardarVentaLocalmente = (venta: any, detalles: any[]) => {
    const ventasPendientes = JSON.parse(localStorage.getItem('ventas_pendientes') || '[]');
    ventasPendientes.push({ venta, detalles });
    localStorage.setItem('ventas_pendientes', JSON.stringify(ventasPendientes));
    setSincronizacionPendiente(true);
  };

  const confirmarVenta = async () => {
    if (carrito.length === 0) {
      mostrarAlertaError('El carrito está vacío');
      return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    
    try {
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{ fecha: new Date().toISOString(), total }])
        .select()
        .single();

      if (ventaError) throw ventaError;

      const detalles = carrito.map(item => ({
        venta_id: ventaData.id,
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
      }));

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detalles);

      if (detallesError) throw detallesError;

      setCarrito([]);
      setCajaDiaria(prev => prev + total);
      mostrarAlertaExito('Venta registrada exitosamente');
    } catch (error) {
      console.error('Error al registrar venta:', error);
      
      const ventaOffline = {
        id: 'offline-' + Date.now(),
        fecha: new Date().toISOString(),
        total,
      };

      const detallesOffline = carrito.map(item => ({
        id: 'detalle-' + Date.now() + '-' + item.producto.id,
        venta_id: ventaOffline.id,
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: item.producto.precio * item.cantidad,
      }));

      guardarVentaLocalmente(ventaOffline, detallesOffline);
      setCarrito([]);
      setCajaDiaria(prev => prev + total);
      mostrarAlertaExito('Venta guardada localmente. Se sincronizará cuando haya conexión.');
    }
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28">
      {/* Header Premium - Caja Diaria */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="text-white/90" size={24} />
              <h1 className="text-xl font-bold text-white tracking-tight">Caja Diaria</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <p className="text-xs font-semibold text-white/90">Hoy</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white tracking-tight">${cajaDiaria.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-emerald-100">
            <TrendingUp size={14} />
            <p className="text-xs font-medium">Ventas registradas hoy</p>
          </div>
        </div>
        
        {sincronizacionPendiente && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 shadow-sm">
            <div className="bg-amber-100 p-1.5 rounded-lg">
              <AlertCircle size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-medium text-amber-800">Sincronización pendiente - Ventas guardadas localmente</p>
          </div>
        )}
      </div>

      {/* Grid de Productos Premium */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Productos Populares</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTOS_COMUNES.map(producto => (
            <button
              key={producto.id}
              onClick={() => agregarAlCarrito(producto)}
              className="group bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-100 rounded-2xl p-4 transition-all duration-200 active:scale-95 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                  <Package size={20} className="text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-800 text-base mb-1 tracking-tight">{producto.nombre}</p>
                <p className="text-emerald-600 font-bold text-lg">${producto.precio.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Monto Libre Premium */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">Monto Libre</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                value={montoLibre}
                onChange={(e) => setMontoLibre(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white rounded-xl pl-8 pr-4 py-3 text-lg font-semibold text-slate-800 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={agregarMontoLibre}
              className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-5 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 flex items-center justify-center"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Carrito Premium */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-600" />
            Carrito de Compras
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {carrito.length} {carrito.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        
        {carrito.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">El carrito está vacío</p>
            <p className="text-slate-400 text-sm mt-1">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {carrito.map(item => (
              <div
                key={item.producto.id}
                className="flex justify-between items-center bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                    <Package size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.producto.nombre}</p>
                    <p className="text-slate-500 text-xs">
                      {item.cantidad} x ${item.producto.precio.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-slate-800">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </p>
                  <button
                    onClick={() => eliminarDelCarrito(item.producto.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t-2 border-slate-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-base font-bold text-slate-600">Total a pagar:</p>
                <p className="text-3xl font-bold text-emerald-600">${totalCarrito.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Confirmar Venta Premium */}
      <button
        onClick={confirmarVenta}
        disabled={carrito.length === 0}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <ShoppingCart size={24} />
        Confirmar Venta
      </button>

      {/* Alerta Premium */}
      {mostrarAlerta && (
        <div
          className={`fixed top-4 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl shadow-2xl z-50 ${
            tipoAlerta === 'success' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          } text-white backdrop-blur-sm`}
        >
          <div className="flex items-center justify-center gap-2">
            {tipoAlerta === 'success' ? (
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingCart size={20} />
              </div>
            ) : (
              <AlertCircle size={24} />
            )}
            <p className="font-semibold text-center">{mensajeAlerta}</p>
          </div>
        </div>
      )}
    </div>
  );
}
