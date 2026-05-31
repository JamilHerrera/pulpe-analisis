import { useState, useEffect } from 'react';
import { Clipboard, Check, AlertTriangle, Package } from 'lucide-react';
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
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Sugerencia de Pedidos</h1>
      <p className="text-sm text-gray-600 mb-6">
        Basado en las ventas de la última semana
      </p>

      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {productos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No hay datos de ventas disponibles</p>
              <p className="text-sm text-gray-400 mt-2">Registra algunas ventas para ver sugerencias</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {productos.map((producto, index) => (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <Package size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{producto.nombre}</p>
                          <p className="text-sm text-gray-500">
                            Sugerido: {producto.cantidadSugerida} unidades
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">{producto.cantidadSugerida}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={copiarPedido}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {copiado ? (
                  <>
                    <Check size={24} />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Clipboard size={24} />
                    Copiar pedido para WhatsApp
                  </>
                )}
              </button>

              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Vista previa del mensaje:</p>
                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                  Pedido Sugerido: {productos.slice(0, 3).map(p => `${p.cantidadSugerida} ${p.nombre}${p.cantidadSugerida > 1 ? 's' : ''}`).join(', ')}
                  {productos.length > 3 && '...'}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
