// Estado del pedido que se está armando. Los distintos módulos leen y
// modifican este mismo objeto para no tener que pasarse datos sueltos.
export const state = {
  tipoServicio: 'pasajero', // 'pasajero' | 'cadeteria'
  recorrido: 'viedma', // 'viedma' | 'patagones' | 'cruce'
  medioPago: 'efectivo', // 'efectivo' | 'transferencia'
  origen: null, // { lat, lng, direccion }
  destino: null, // { lat, lng, direccion }
};
