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

/**
 * Decide el recorrido real ('viedma' | 'patagones' | 'cruce') a partir de la
 * ciudad detectada en el origen y el destino marcados en el mapa.
 * Devuelve null si no se pudo determinar la ciudad de alguno de los dos
 * puntos — en ese caso no hay que forzar nada, sino avisar para que se
 * revise a mano.
 */
export function detectarRecorrido(origen, destino) {
  if (!origen?.zona || !destino?.zona) return null;
  if (origen.zona === destino.zona) return origen.zona;
  return 'cruce';
}
