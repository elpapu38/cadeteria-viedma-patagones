const ETIQUETAS_RECORRIDO = {
  viedma: 'Tarifa fija: Interno Viedma',
  patagones: 'Tarifa fija: Interno C. de Patagones',
  cruce: 'Tarifa fija: Cruce entre ciudades',
};

/**
 * Devuelve { total, detalle } según el recorrido y tipo de servicio
 * seleccionados. Siempre es tarifa fija: nunca se calcula por km.
 */
export function calcularTotal(state, tarifas) {
  const tarifasPorRecorrido = {
    viedma: tarifas.fijoViedma,
    patagones: tarifas.fijoPatagones,
    cruce: tarifas.fijoCruce,
  };

  let total = tarifasPorRecorrido[state.recorrido] ?? 0;
  let detalle = ETIQUETAS_RECORRIDO[state.recorrido] ?? '';

  if (state.tipoServicio === 'pasajero') {
    total += tarifas.recargoPasajero;
    detalle += ' + recargo pasajero';
  }

  return { total, detalle };
}

export function formatearPrecio(valor) {
  return `$ ${Math.round(valor).toLocaleString('es-AR')}`;
}
