import { cargarTarifas, guardarTarifas } from './config.js';
import { state } from './state.js';
import { initMapa } from './mapa.js';
import { calcularTotal, formatearPrecio, detectarRecorrido } from './cotizador.js';
import { initAdmin } from './admin.js';
import { enviarPedidoPorWhatsApp } from './whatsapp.js';

let tarifas = cargarTarifas();

const txtTotal = document.getElementById('txt-total');
const txtDetalle = document.getElementById('txt-detalle');
const inputOrigen = document.getElementById('input-origen');
const inputDestino = document.getElementById('input-destino');
const cajaAlias = document.getElementById('caja-alias');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const avisoWhatsapp = document.getElementById('aviso-whatsapp');
const avisoMapa = document.getElementById('aviso-mapa');
const chipsRecorrido = document.querySelectorAll('[data-recorrido]');
const avisoRecorrido = document.getElementById('aviso-recorrido');

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
// (ya sea porque se marcó en el mapa o porque se escribió a mano).
function actualizarEstadoBotonWhatsapp() {
  const hayOrigen = inputOrigen.value.trim() !== '';
  const hayDestino = inputDestino.value.trim() !== '';
  const puedeEnviar = hayOrigen && hayDestino;

  btnWhatsapp.disabled = !puedeEnviar;
  avisoWhatsapp.classList.toggle('hidden', puedeEnviar);
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

// --- Chips: tipo de servicio (pasajero / cadetería) ---
document.querySelectorAll('[data-servicio]').forEach((chip) => {
  chip.addEventListener('click', () => {
    seleccionarChip('[data-servicio]', chip, 'servicio', (valor) => {
      state.tipoServicio = valor;
      actualizarResumen();
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
    });
  });
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
  onGuardar: (tarifasActualizadas) => {
    tarifas = tarifasActualizadas;
    guardarTarifas(tarifas);
    actualizarResumen();
  },
});

// --- Copiar alias ---
document.getElementById('btn-copiar-alias')?.addEventListener('click', () => {
  const alias = document.getElementById('txt-alias').textContent;
  navigator.clipboard.writeText(alias);
  alert('Alias copiado al portapapeles');
});

// --- Enviar por WhatsApp ---
btnWhatsapp.addEventListener('click', () => {
  const { total, detalle } = actualizarResumen();
  enviarPedidoPorWhatsApp({ state, detalle, total });
});

// Íconos y primer cálculo
if (window.lucide) window.lucide.createIcons();
actualizarResumen();
actualizarEstadoBotonWhatsapp();
