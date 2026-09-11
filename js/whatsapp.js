export function enviarPedidoPorWhatsApp({ state, detalle, total, numeroWhatsapp }) {
  const origenTxt = state.origen?.direccion || 'A confirmar';
  const destinoTxt = state.destino?.direccion || 'A confirmar';
  const servicioTxt = state.tipoServicio === 'pasajero' ? 'Pasajero' : 'Cadetería / Envío';
  const pagoTxt = state.medioPago === 'efectivo' ? 'Efectivo' : 'Transferencia / MP';

  // Sin emojis a propósito: la app de WhatsApp para PC a veces no decodifica
  // bien algunos, y el mensaje puede llegar con símbolos rotos. El orden y
  // las negritas (*así*) alcanzan para que se vea prolijo en cualquier app.
  const lineas = [
    '*Nuevo pedido - Cruce Directo*',
    '',
    `*Origen:* ${origenTxt}`,
    ...enlaceMaps(state.origen),
    '',
    `*Destino:* ${destinoTxt}`,
    ...enlaceMaps(state.destino),
    '',
    `*Recorrido:* ${detalle}`,
    `*Servicio:* ${servicioTxt}`,
    `*Pago:* ${pagoTxt}`,
    `*Total estimado:* ${formatearParaMensaje(total)}`,
  ];

  const mensajeCodificado = encodeURIComponent(lineas.join('\n'));
  const enlace = `https://wa.me/${numeroWhatsapp}?text=${mensajeCodificado}`;

  abrirEnlace(enlace);
}

// Si el punto viene del mapa (tiene lat/lng), se agrega un link de Google
// Maps para que el remisero pueda tocarlo e ir directo a navegar. Si el
// cliente escribió la dirección a mano, no hay coordenadas y no se agrega nada.
function enlaceMaps(punto) {
  if (!punto || punto.lat === undefined || punto.lng === undefined) return [];
  return [`Ver en el mapa: https://www.google.com/maps?q=${punto.lat},${punto.lng}`];
}

function abrirEnlace(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function formatearParaMensaje(valor) {
  return `$${Math.round(valor).toLocaleString('es-AR')}`;
}
