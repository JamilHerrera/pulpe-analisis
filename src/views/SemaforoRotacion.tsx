import { useState, useEffect } from 'react';
import { TrendingUp, Minus, TrendingDown, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ProductoRotacion } from '../types';

export default function SemaforoRotacion() {
  const [productos, setProductos] = useState<ProductoRotacion[]>([]);
  const [pestañaActiva, setPestañaActiva] = useState<'alta' | 'media' | 'baja'>('alta');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatosRotacion();
  }, []);

  const cargarDatosRotacion = async () => {
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

      const productosRotacion: ProductoRotacion[] = Object.entries(ventasPorProducto).map(([nombre, total_unidades]) => {
        let categoria: 'alta' | 'media' | 'baja';
        if (total_unidades >= 20) {
          categoria = 'alta';
        } else if (total_unidades >= 10) {
          categoria = 'media';
        } else {
          categoria = 'baja';
        }
        return { nombre, total_unidades, categoria };
      });

      setProductos(productosRotacion);
    } catch (error) {
      console.error('Error al cargar datos de rotación:', error);
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => p.categoria === pestañaActiva);

  const colores = {
    alta: 'bg-red-500',
    media: 'bg-yellow-500',
    baja: 'bg-blue-500',
  };

  const coloresTexto = {
    alta: 'text-red-600',
    media: 'text-yellow-600',
    baja: 'text-blue-600',
  };

  const iconos = {
    alta: TrendingUp,
    media: Minus,
    baja: TrendingDown,
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Semáforo de Rotación</h1>
      <p className="text-sm text-gray-600 mb-6">
        Análisis de ventas de la última semana
      </p>

      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPestañaActiva('alta')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                pestañaActiva === 'alta'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp size={20} />
                <span>Alta</span>
              </div>
            </button>
            <button
              onClick={() => setPestañaActiva('media')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                pestañaActiva === 'media'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Minus size={20} />
                <span>Media</span>
              </div>
            </button>
            <button
              onClick={() => setPestañaActiva('baja')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                pestañaActiva === 'baja'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown size={20} />
                <span>Baja</span>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <AlertTriangle size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No hay productos en esta categoría</p>
              </div>
            ) : (
              productosFiltrados.map((producto, index) => {
                const Icono = iconos[producto.categoria];
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${colores[producto.categoria]} p-2 rounded-lg`}>
                          <Icono size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{producto.nombre}</p>
                          <p className={`text-sm font-medium ${coloresTexto[producto.categoria]}`}>
                            {producto.categoria === 'alta' && 'Alta rotación'}
                            {producto.categoria === 'media' && 'Rotación media'}
                            {producto.categoria === 'baja' && 'Baja rotación'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">{producto.total_unidades}</p>
                        <p className="text-xs text-gray-500">unidades</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {productos.length === 0 && !cargando && (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No hay datos de ventas disponibles</p>
              <p className="text-sm text-gray-400 mt-2">Registra algunas ventas para ver el análisis</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
