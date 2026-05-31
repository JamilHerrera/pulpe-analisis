export interface Producto {
  id: string;
  nombre: string;
  precio: number;
}

export interface CarritoItem {
  producto: Producto;
  cantidad: number;
}

export interface Venta {
  id: string;
  fecha: string;
  total: number;
}

export interface DetalleVenta {
  id: string;
  venta_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ProductoRotacion {
  nombre: string;
  total_unidades: number;
  categoria: 'alta' | 'media' | 'baja';
}
