export function enviarPedidoPorWhatsApp({ state, detalle, total, numeroWhatsapp }) {
  const origenTxt = state.origen?.direccion || 'A confirmar';
  const destinoTxt = state.destino?.direccion || 'A confirmar';
  const servicioTxt = state.tipoServicio === 'pasajero' ? 'Pasajero' : 'Cadetería / Envío';
  const pagoTxt = state.medioPago === 'efectivo' ? 'Efectivo' : 'Transferencia / MP';

  // Se arma con saltos de línea reales y se codifica todo junto con
  // encodeURIComponent (en vez de insertar %0A a mano), así los acentos,
  // la "ñ" y los emojis viajan bien en cualquier celular.
  const lineas = [
    '¡Hola! Solicito servicio de moto.',
    '',
    `📌 *Origen:* ${origenTxt}`,
    ...enlaceMaps(state.origen),
    '',
    `🏁 *Destino:* ${destinoTxt}`,
    ...enlaceMaps(state.destino),
    '',
    `📐 ${detalle}`,
    `🛵 *Servicio:* ${servicioTxt}`,
    `💳 *Pago:* ${pagoTxt}`,
    `💰 *Estimado:* ${formatearParaMensaje(total)}`,
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
  return [`🗺️ https://www.google.com/maps?q=${punto.lat},${punto.lng}`];
}

// Crea un link real y lo "clickea" por código, en vez de usar window.open()
// directamente sobre una URL armada a mano. Es el mismo resultado para el
// usuario, pero es la forma estándar de hacerlo en un sitio real.
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
