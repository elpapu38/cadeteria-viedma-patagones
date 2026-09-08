// TODO: reemplazar por el número real del chofer/servicio (con código de país, sin espacios ni "+")
const NUMERO_WHATSAPP = '5492920000000';

export function enviarPedidoPorWhatsApp({ state, detalle, total }) {
  const origenTxt = state.origen?.direccion || 'A confirmar';
  const destinoTxt = state.destino?.direccion || 'A confirmar';
  const servicioTxt = state.tipoServicio === 'pasajero' ? 'Pasajero' : 'Cadetería / Envío';
  const pagoTxt = state.medioPago === 'efectivo' ? 'Efectivo' : 'Transferencia / MP';

  const mensaje =
    `¡Hola! Solicito servicio de moto.%0A%0A` +
    `📌 Origen: ${origenTxt}%0A` +
    `🏁 Destino: ${destinoTxt}%0A` +
    `📐 ${detalle}%0A` +
    `🛵 Servicio: ${servicioTxt}%0A` +
    `💳 Pago: ${pagoTxt}%0A` +
    `💰 Estimado: ${formatearParaMensaje(total)}`;

  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`, '_blank');
}

function formatearParaMensaje(valor) {
  return `$${Math.round(valor).toLocaleString('es-AR')}`;
}
