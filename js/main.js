import { cargarTarifas, guardarTarifas } from './config.js';
import { state } from './state.js';
import { initMapa } from './mapa.js';
import { calcularTotal, formatearPrecio, detectarRecorrido } from './cotizador.js';
import { initAdmin } from './admin.js';
import { enviarPedidoPorWhatsApp } from './whatsapp.js';
import { estaAbierto } from './horario.js';
import { estaDentroDeCobertura } from './distancia.js';

// Se espera a que responda la planilla antes de seguir armando la página
// (si falla o tarda, cargarTarifas ya devuelve los valores por defecto).
const tarifas = await cargarTarifas();

const txtTotal = document.getElementById('txt-total');
const txtDetalle = document.getElementById('txt-detalle');
const inputOrigen = document.getElementById('input-origen');
const inputDestino = document.getElementById('input-destino');
const cajaAlias = document.getElementById('caja-alias');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const avisoWhatsapp = document.getElementById('aviso-whatsapp');
const avisoMapa = document.getElementById('aviso-mapa');
const avisoCobertura = document.getElementById('aviso-cobertura');
const chipsRecorrido = document.querySelectorAll('[data-recorrido]');
const avisoRecorrido = document.getElementById('aviso-recorrido');
const bannerHorario = document.getElementById('banner-horario');
const formularioPedido = document.getElementById('formulario-pedido');
const avisoServicioPausado = document.getElementById('aviso-servicio-pausado');
const inputComentario = document.getElementById('input-comentario');
const confirmacionEnvio = document.getElementById('confirmacion-envio');

const CLAVE_ULTIMA_SELECCION = 'cd_ultima_seleccion';

const ETIQUETAS_RECORRIDO = {
  viedma: 'Interno Viedma',
  patagones: 'Interno C. de Patagones',
  cruce: 'Cruce entre ciudades',
};

function marcarRecorridoEnUI(valor) {
  chipsRecorrido.forEach((chip) => chip.classList.toggle('selected', chip.dataset.recorrido === valor));
}

function bloquearChipsRecorrido(bloquear) {
  chipsRecorrido.forEach((chip) => chip.classList.toggle('bloqueado', bloquear));
}

function mostrarAviso(texto) {
  avisoRecorrido.textContent = texto || '';
  avisoRecorrido.classList.toggle('hidden', !texto);
}

// Compara lo que el cliente eligió a mano contra la ciudad real detectada
// en los dos puntos del mapa, y corrige el recorrido si no coinciden.
function sincronizarRecorridoConMapa() {
  if (!state.origen || !state.destino) {
    bloquearChipsRecorrido(false);
    mostrarAviso('');
    return;
  }

  const detectado = detectarRecorrido(state.origen, state.destino);

  if (detectado) {
    state.recorrido = detectado;
    marcarRecorridoEnUI(detectado);
    bloquearChipsRecorrido(true);
    mostrarAviso(`Recorrido detectado según el mapa: ${ETIQUETAS_RECORRIDO[detectado]}.`);
  } else {
    bloquearChipsRecorrido(false);
    mostrarAviso('No pudimos confirmar la ciudad con las direcciones marcadas: verificá el recorrido elegido antes de enviar.');
  }

  actualizarResumen();
}

// Solo se puede enviar el pedido si hay algo cargado en ambos campos
// (ya sea porque se marcó en el mapa o porque se escribió a mano), y si
// los puntos marcados en el mapa están dentro de la zona de cobertura.
function estaFueraDeCobertura(punto) {
  if (!punto || punto.lat === undefined || punto.lng === undefined) return false; // sin coordenadas (dirección escrita a mano): no se puede chequear
  return !estaDentroDeCobertura(punto);
}

function actualizarEstadoBotonWhatsapp() {
  const hayOrigen = inputOrigen.value.trim() !== '';
  const hayDestino = inputDestino.value.trim() !== '';
  const fueraDeCobertura = estaFueraDeCobertura(state.origen) || estaFueraDeCobertura(state.destino);

  avisoCobertura.classList.toggle('hidden', !fueraDeCobertura);

  const puedeEnviar = hayOrigen && hayDestino && !fueraDeCobertura;
  btnWhatsapp.disabled = !puedeEnviar;
  avisoWhatsapp.classList.toggle('hidden', puedeEnviar || fueraDeCobertura);
}

function seleccionarChip(grupoSelector, chipElegido, dataAttr, callback) {
  document.querySelectorAll(grupoSelector).forEach((chip) => chip.classList.remove('selected'));
  chipElegido.classList.add('selected');
  callback(chipElegido.dataset[dataAttr]);
}

function actualizarResumen() {
  const { total, detalle } = calcularTotal(state, tarifas);
  txtTotal.textContent = formatearPrecio(total);
  txtDetalle.textContent = detalle;
  return { total, detalle };
}

// Solo informa: nunca bloquea el pedido, aunque esté fuera de horario.
function actualizarBannerHorario() {
  if (!tarifas.horarioApertura || !tarifas.horarioCierre) {
    bannerHorario.classList.add('hidden');
    return;
  }

  bannerHorario.classList.remove('hidden');

  if (estaAbierto(tarifas)) {
    bannerHorario.textContent = `Abierto ahora · atendemos de ${tarifas.horarioApertura} a ${tarifas.horarioCierre} hs`;
    bannerHorario.style.background = '#DCEFE2';
    bannerHorario.style.color = '#1F6B3A';
  } else {
    bannerHorario.textContent = `Fuera de horario de atención (de ${tarifas.horarioApertura} a ${tarifas.horarioCierre} hs) — igual podés dejar tu pedido cargado.`;
    bannerHorario.style.background = '#F1E7D2';
    bannerHorario.style.color = '#8A5A1E';
  }
}

// SEO local: le da a Google información estructurada sobre el negocio
// (nombre, zona, teléfono, horario), tomada de los mismos datos reales de
// la planilla, para que nunca quede desactualizada.
function actualizarDatosEstructurados() {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Cruce Directo',
    description:
      'Cadetería, envíos y viajes de pasajero en moto entre Viedma y Carmen de Patagones.',
    url: window.location.href,
    areaServed: [
      { '@type': 'City', name: 'Viedma' },
      { '@type': 'City', name: 'Carmen de Patagones' },
    ],
  };

  if (tarifas.numeroWhatsapp) {
    datos.telephone = `+${tarifas.numeroWhatsapp}`;
  }

  if (tarifas.horarioApertura && tarifas.horarioCierre) {
    datos.openingHoursSpecification = {
      '@type': 'OpeningHoursSpecification',
      opens: tarifas.horarioApertura,
      closes: tarifas.horarioCierre,
    };
  }

  const scriptExistente = document.getElementById('datos-estructurados');
  if (scriptExistente) scriptExistente.remove();

  const script = document.createElement('script');
  script.id = 'datos-estructurados';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(datos);
  document.head.appendChild(script);
}

// Si el admin pausó el sitio desde el panel, se oculta el formulario y se
// muestra un aviso en su lugar. Nunca se corta el acceso al panel admin
// (queda arriba, en el header) para poder reactivarlo.
function actualizarModoPausado() {
  const pausado = tarifas.servicioPausado === 'si';
  formularioPedido.classList.toggle('hidden', pausado);
  avisoServicioPausado.classList.toggle('hidden', !pausado);
}

// Recuerda, solo en este navegador, la última combinación de tipo de
// servicio y medio de pago que eligió el cliente, para no hacerlo repetir
// todo de cero en su próxima visita. No guarda direcciones (cambian en
// cada viaje) ni nada de la planilla.
function guardarUltimaSeleccion() {
  try {
    localStorage.setItem(
      CLAVE_ULTIMA_SELECCION,
      JSON.stringify({ tipoServicio: state.tipoServicio, medioPago: state.medioPago })
    );
  } catch {
    // Si el navegador bloquea localStorage (modo privado, etc.), no pasa nada grave.
  }
}

function aplicarUltimaSeleccion() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_ULTIMA_SELECCION));
    if (!guardado) return;

    if (guardado.tipoServicio) {
      state.tipoServicio = guardado.tipoServicio;
      document.querySelectorAll('[data-servicio]').forEach((chip) => {
        chip.classList.toggle('selected', chip.dataset.servicio === guardado.tipoServicio);
      });
    }

    if (guardado.medioPago) {
      state.medioPago = guardado.medioPago;
      document.querySelectorAll('[data-pago]').forEach((chip) => {
        chip.classList.toggle('selected', chip.dataset.pago === guardado.medioPago);
      });
      cajaAlias.classList.toggle('hidden', guardado.medioPago !== 'transferencia');
    }
  } catch {
    // Si el valor guardado está corrupto o localStorage no está disponible, se ignora.
  }
}


// --- Chips: tipo de servicio (pasajero / cadetería) ---
document.querySelectorAll('[data-servicio]').forEach((chip) => {
  chip.addEventListener('click', () => {
    seleccionarChip('[data-servicio]', chip, 'servicio', (valor) => {
      state.tipoServicio = valor;
      actualizarResumen();
      guardarUltimaSeleccion();
    });
  });
});

// --- Chips: recorrido fijo (viedma / patagones / cruce) ---
document.querySelectorAll('[data-recorrido]').forEach((chip) => {
  chip.addEventListener('click', () => {
    seleccionarChip('[data-recorrido]', chip, 'recorrido', (valor) => {
      state.recorrido = valor;
      actualizarResumen();
    });
  });
});

// --- Chips: medio de pago (efectivo / transferencia) ---
document.querySelectorAll('[data-pago]').forEach((chip) => {
  chip.addEventListener('click', () => {
    seleccionarChip('[data-pago]', chip, 'pago', (valor) => {
      state.medioPago = valor;
      cajaAlias.classList.toggle('hidden', valor !== 'transferencia');
      guardarUltimaSeleccion();
    });
  });
});

// --- Comentario opcional ---
inputComentario.addEventListener('input', () => {
  state.comentario = inputComentario.value;
});

// --- Mapa ---
initMapa({
  onOrigenSet: (punto) => {
    state.origen = punto;
    inputOrigen.value = punto.direccion;
    avisoMapa.classList.toggle('hidden', !punto.error);
    sincronizarRecorridoConMapa();
    actualizarEstadoBotonWhatsapp();
  },
  onDestinoSet: (punto) => {
    state.destino = punto;
    inputDestino.value = punto.direccion;
    avisoMapa.classList.toggle('hidden', !punto.error);
    sincronizarRecorridoConMapa();
    actualizarEstadoBotonWhatsapp();
  },
  onReiniciar: () => {
    state.destino = null;
    inputDestino.value = '';
    sincronizarRecorridoConMapa();
    actualizarEstadoBotonWhatsapp();
  },
});

// Si el cliente escribe la dirección a mano (por ejemplo, tras un error del mapa)
[inputOrigen, inputDestino].forEach((input) => {
  input.addEventListener('input', actualizarEstadoBotonWhatsapp);
});

// --- Panel admin ---
initAdmin({
  tarifas,
  onGuardar: async (cambios, claveActual) => {
    const resultado = await guardarTarifas(cambios, claveActual);

    if (resultado.ok) {
      // Se refleja el cambio al instante en esta pestaña, sin esperar a
      // volver a consultar la planilla.
      Object.assign(tarifas, cambios);
      if (cambios.nuevaClave) {
        tarifas.claveAdmin = cambios.nuevaClave;
      }
      actualizarResumen();
      actualizarBannerHorario();
      actualizarDatosEstructurados();
      actualizarModoPausado();
    }

    return resultado;
  },
});

// --- Copiar alias ---
document.getElementById('btn-copiar-alias')?.addEventListener('click', () => {
  const alias = document.getElementById('txt-alias').textContent;
  navigator.clipboard.writeText(alias);
  alert('Alias copiado al portapapeles');
});

// --- Enviar por WhatsApp ---
let enviandoPedido = false;
btnWhatsapp.addEventListener('click', () => {
  if (enviandoPedido) return; // evita que un doble clic abra dos pedidos/pestañas
  enviandoPedido = true;

  const { total, detalle } = actualizarResumen();
  enviarPedidoPorWhatsApp({ state, detalle, total, numeroWhatsapp: tarifas.numeroWhatsapp });

  confirmacionEnvio.classList.remove('hidden');
  avisoWhatsapp.classList.add('hidden');
  setTimeout(() => {
    confirmacionEnvio.classList.add('hidden');
    enviandoPedido = false;
  }, 4000);
});

// Íconos y primer cálculo
if (window.lucide) window.lucide.createIcons();
aplicarUltimaSeleccion();
actualizarResumen();
actualizarEstadoBotonWhatsapp();
actualizarBannerHorario();
actualizarDatosEstructurados();
actualizarModoPausado();
setInterval(actualizarBannerHorario, 60000); // se refresca solo por si el cliente deja la página abierta y cambia la hora
