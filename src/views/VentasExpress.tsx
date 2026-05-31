import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, AlertCircle } from 'lucide-react';
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
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ventas Express</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 font-medium">
            Caja Diaria: ${cajaDiaria.toFixed(2)}
          </p>
        </div>
        {sincronizacionPendiente && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-yellow-600" />
            <p className="text-xs text-yellow-800">Sincronización pendiente</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {PRODUCTOS_COMUNES.map(producto => (
          <button
            key={producto.id}
            onClick={() => agregarAlCarrito(producto)}
            className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 transition-all active:scale-95 shadow-sm"
          >
            <p className="font-semibold text-gray-800 text-lg">{producto.nombre}</p>
            <p className="text-blue-600 font-bold">${producto.precio.toFixed(2)}</p>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto Libre
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={montoLibre}
            onChange={(e) => setMontoLibre(e.target.value)}
            placeholder="0.00"
            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={agregarMontoLibre}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <ShoppingCart size={20} />
          Carrito
        </h2>
        {carrito.length === 0 ? (
          <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
        ) : (
          <div className="space-y-2">
            {carrito.map(item => (
              <div
                key={item.producto.id}
                className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.producto.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {item.cantidad} x ${item.producto.precio.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-800">
                    ${(item.producto.precio * item.cantidad).toFixed(2)}
                  </p>
                  <button
                    onClick={() => eliminarDelCarrito(item.producto.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t-2 border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-gray-800">Total:</p>
                <p className="text-2xl font-bold text-blue-600">${totalCarrito.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={confirmarVenta}
        disabled={carrito.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg"
      >
        Confirmar Venta
      </button>

      {mostrarAlerta && (
        <div
          className={`fixed top-4 left-4 right-4 max-w-md mx-auto p-4 rounded-lg shadow-lg z-50 ${
            tipoAlerta === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <p className="font-medium text-center">{mensajeAlerta}</p>
        </div>
      )}
    </div>
  );
}
