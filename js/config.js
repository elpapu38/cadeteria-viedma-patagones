// Todas las tarifas son fijas por recorrido (no hay modo "por kilómetro").
// Estos valores son de ejemplo: se editan desde el panel de admin y quedan
// guardados en el navegador (localStorage), no hace falta tocar este archivo.

const STORAGE_KEY = 'cd_tarifas_v1';

export const tarifasPorDefecto = {
  fijoViedma: 1500,
  fijoPatagones: 1800,
  fijoCruce: 2800,
  recargoPasajero: 400,
  claveAdmin: '1234',
};

export function cargarTarifas() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!guardado) return { ...tarifasPorDefecto };
    // Combina lo guardado con los valores por defecto, por si en el futuro
    // se agrega algún campo nuevo que todavía no esté en el localStorage del usuario.
    return { ...tarifasPorDefecto, ...guardado };
  } catch {
    return { ...tarifasPorDefecto };
  }
}

export function guardarTarifas(tarifas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tarifas));
}
