import { useState, useEffect } from 'react';
import { AlertTriangle, Flame, Activity, Zap } from 'lucide-react';
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

  const configuracionCategoria = {
    alta: {
      gradiente: 'from-rose-500 to-red-600',
      gradienteSuave: 'from-rose-50 to-red-100',
      borde: 'border-rose-300',
      texto: 'text-rose-700',
      icono: Flame,
      etiqueta: 'Alta Rotación',
      descripcion: 'Productos estrella con alta demanda',
      sombra: 'shadow-rose-200',
    },
    media: {
      gradiente: 'from-amber-400 to-orange-500',
      gradienteSuave: 'from-amber-50 to-orange-100',
      borde: 'border-amber-300',
      texto: 'text-amber-700',
      icono: Activity,
      etiqueta: 'Rotación Media',
      descripcion: 'Movimiento constante pero pausado',
      sombra: 'shadow-amber-200',
    },
    baja: {
      gradiente: 'from-blue-500 to-indigo-600',
      gradienteSuave: 'from-blue-50 to-indigo-100',
      borde: 'border-blue-300',
      texto: 'text-blue-700',
      icono: Zap,
      etiqueta: 'Baja Rotación',
      descripcion: 'Productos estancados en riesgo',
      sombra: 'shadow-blue-200',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      {/* Header Premium */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Semáforo de Rotación</h1>
        <p className="text-sm text-slate-600">
          Análisis de ventas de la última semana
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
          {/* Pestañas Premium con Gradientes */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPestañaActiva('alta')}
              className={`flex-1 py-3 px-3 rounded-2xl font-bold transition-all duration-200 ${
                pestañaActiva === 'alta'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-200'
                  : 'bg-white text-slate-600 hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Flame size={22} />
                <span className="text-xs">Alta</span>
              </div>
            </button>
            <button
              onClick={() => setPestañaActiva('media')}
              className={`flex-1 py-3 px-3 rounded-2xl font-bold transition-all duration-200 ${
                pestañaActiva === 'media'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200'
                  : 'bg-white text-slate-600 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Activity size={22} />
                <span className="text-xs">Media</span>
              </div>
            </button>
            <button
              onClick={() => setPestañaActiva('baja')}
              className={`flex-1 py-3 px-3 rounded-2xl font-bold transition-all duration-200 ${
                pestañaActiva === 'baja'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-600 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <Zap size={22} />
                <span className="text-xs">Baja</span>
              </div>
            </button>
          </div>

          {/* Tarjeta de Categoría Activa */}
          <div className={`mb-6 bg-gradient-to-r ${configuracionCategoria[pestañaActiva].gradienteSuave} rounded-2xl p-4 border-2 ${configuracionCategoria[pestañaActiva].borde}`}>
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-r ${configuracionCategoria[pestañaActiva].gradiente} p-3 rounded-xl shadow-md ${configuracionCategoria[pestañaActiva].sombra}`}>
                {(() => {
                  const Icono = configuracionCategoria[pestañaActiva].icono;
                  return <Icono size={24} className="text-white" />;
                })()}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${configuracionCategoria[pestañaActiva].texto}`}>
                  {configuracionCategoria[pestañaActiva].etiqueta}
                </h3>
                <p className="text-sm text-slate-600">{configuracionCategoria[pestañaActiva].descripcion}</p>
              </div>
            </div>
          </div>

          {/* Lista de Productos Premium */}
          <div className="space-y-3">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No hay productos en esta categoría</p>
                <p className="text-slate-400 text-sm mt-1">Registra más ventas para ver el análisis</p>
              </div>
            ) : (
              productosFiltrados.map((producto, index) => {
                const config = configuracionCategoria[producto.categoria];
                const Icono = config.icono;
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`bg-gradient-to-r ${config.gradienteSuave} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                          <Icono size={20} className={config.texto} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base tracking-tight">{producto.nombre}</p>
                          <p className={`text-xs font-medium ${config.texto}`}>
                            {config.etiqueta}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-800">{producto.total_unidades}</p>
                        <p className="text-xs text-slate-500 font-medium">unidades vendidas</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Estado sin datos */}
          {productos.length === 0 && !cargando && (
            <div className="text-center py-8 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No hay datos de ventas disponibles</p>
              <p className="text-slate-400 text-sm mt-1">Registra algunas ventas para ver el análisis</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
