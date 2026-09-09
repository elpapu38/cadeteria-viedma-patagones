// TODO: reemplazar por el número real del chofer/servicio (con código de país, sin espacios ni "+")
const NUMERO_WHATSAPP = '5492920000000';

export function enviarPedidoPorWhatsApp({ state, detalle, total }) {
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
    `📌 Origen: ${origenTxt}`,
    `🏁 Destino: ${destinoTxt}`,
    `📐 ${detalle}`,
    `🛵 Servicio: ${servicioTxt}`,
    `💳 Pago: ${pagoTxt}`,
    `💰 Estimado: ${formatearParaMensaje(total)}`,
  ];

  const mensajeCodificado = encodeURIComponent(lineas.join('\n'));
  const enlace = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;

  abrirEnlace(enlace);
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
