import { cargarTarifas, guardarTarifas } from './config.js';
import { state } from './state.js';
import { initMapa } from './mapa.js';
import { calcularTotal, formatearPrecio } from './cotizador.js';
import { initAdmin } from './admin.js';
import { enviarPedidoPorWhatsApp } from './whatsapp.js';

let tarifas = cargarTarifas();

const txtTotal = document.getElementById('txt-total');
const txtDetalle = document.getElementById('txt-detalle');
const inputOrigen = document.getElementById('input-origen');
const inputDestino = document.getElementById('input-destino');
const cajaAlias = document.getElementById('caja-alias');
const btnWhatsapp = document.getElementById('btn-whatsapp');

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
  },
  onDestinoSet: (punto) => {
    state.destino = punto;
    inputDestino.value = punto.direccion;
  },
  onReiniciar: () => {
    state.destino = null;
    inputDestino.value = '';
  },
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
