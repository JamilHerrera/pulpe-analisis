import { useState, useEffect } from 'react';
import { Clipboard, Check, AlertTriangle, Package, MessageCircle, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductoSugerido {
  nombre: string;
  cantidadSugerida: number;
}

export default function SugerenciaPedidos() {
  const [productos, setProductos] = useState<ProductoSugerido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    cargarSugerencias();
  }, []);

  const cargarSugerencias = async () => {
    try {
      setCargando(true);
      const haceUnaSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('detalle_ventas')
        .select('producto_nombre, cantidad')
        .gte('venta_id', haceUnaSemana);

      if (error) throw error;

      const ventasPorProducto: { [key: string]: number } = {};
      
      if (data) {
        data.forEach(detalle => {
          const nombre = detalle.producto_nombre;
          ventasPorProducto[nombre] = (ventasPorProducto[nombre] || 0) + (detalle.cantidad || 0);
        });
      }

      const sugerencias: ProductoSugerido[] = Object.entries(ventasPorProducto)
        .map(([nombre, total_unidades]) => ({
          nombre,
          cantidadSugerida: Math.ceil(total_unidades * 1.5),
        }))
        .sort((a, b) => b.cantidadSugerida - a.cantidadSugerida);

      setProductos(sugerencias);
    } catch (error) {
      console.error('Error al cargar sugerencias:', error);
    } finally {
      setCargando(false);
    }
  };

  const copiarPedido = () => {
    const texto = productos
      .map(p => `${p.cantidadSugerida} ${p.nombre}${p.cantidadSugerida > 1 ? 's' : ''}`)
      .join(', ');
    
    const mensajeCompleto = `Pedido Sugerido: ${texto}`;
    
    navigator.clipboard.writeText(mensajeCompleto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      {/* Header Premium */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-emerald-500" size={24} />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sugerencia de Pedidos</h1>
        </div>
        <p className="text-sm text-slate-600">
          Basado en las ventas de la última semana
        </p>
      </div>

      {cargando ? (
        <div className="flex justify-center items-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-emerald-500"></div>
          </div>
        </div>
      ) : (
        <>
          {productos.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No hay datos de ventas disponibles</p>
              <p className="text-slate-400 text-sm mt-1">Registra algunas ventas para ver sugerencias</p>
            </div>
          ) : (
            <>
              {/* Lista de Chequeo Premium */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Productos a Pedir</h2>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {productos.length} productos
                  </span>
                </div>
                
                <div className="space-y-3">
                  {productos.map((producto, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-white w-8 h-8 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Package size={16} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{producto.nombre}</p>
                          <p className="text-xs text-slate-500">Cantidad sugerida</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50 px-4 py-2 rounded-xl">
                        <p className="text-2xl font-bold text-emerald-600">{producto.cantidadSugerida}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Copiar WhatsApp Premium */}
              <button
                onClick={copiarPedido}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
              >
                {copiado ? (
                  <>
                    <div className="bg-white/20 p-2 rounded-full">
                      <Check size={24} />
                    </div>
                    ¡Copiado al portapapeles!
                  </>
                ) : (
                  <>
                    <MessageCircle size={24} />
                    Copiar pedido para WhatsApp
                  </>
                )}
              </button>

              {/* Vista Previa Premium */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Clipboard size={18} className="text-slate-600" />
                  <p className="text-sm font-semibold text-slate-700">Vista previa del mensaje</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    <span className="font-semibold text-emerald-600">Pedido Sugerido:</span>{' '}
                    {productos.slice(0, 3).map(p => `${p.cantidadSugerida} ${p.nombre}${p.cantidadSugerida > 1 ? 's' : ''}`).join(', ')}
                    {productos.length > 3 && '...'}
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
