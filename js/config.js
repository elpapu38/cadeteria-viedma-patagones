// Los valores de acá abajo son el "plan B": si por algún motivo no se puede
// consultar la planilla de Google (sin internet, Google caído, etc.), el
// sitio sigue funcionando con estos valores en vez de romperse.
export const tarifasPorDefecto = {
  fijoViedma: 1500,
  fijoPatagones: 1800,
  fijoCruce: 2800,
  recargoPasajero: 400,
  horarioApertura: '08:00',
  horarioCierre: '21:00',
  claveAdmin: '1234',
  numeroWhatsapp: '', // TODO: se completa desde la planilla (fila "numeroWhatsapp")
};

// URL de la Google Apps Script Web App conectada a la planilla de configuración.
const URL_CONFIG =
  'https://script.google.com/macros/s/AKfycbzHe2nfFML71BGTyRB5vJmWBo8Ds0bdMpMuF-U26Typrve9BXvOZ6X3NDK5-TbvgXI_/exec';

export async function cargarTarifas() {
  try {
    const respuesta = await fetch(URL_CONFIG);
    if (!respuesta.ok) throw new Error('Respuesta no OK de la planilla');
    const datos = await respuesta.json();
    // Se combina con los valores por defecto, por si en la planilla falta
    // alguna clave nueva que todavía no se agregó a mano.
    return { ...tarifasPorDefecto, ...normalizarNumeros(datos) };
  } catch {
    return { ...tarifasPorDefecto };
  }
}

// La planilla devuelve todo como texto; convertimos a número los campos que corresponde.
function normalizarNumeros(datos) {
  const camposNumericos = ['fijoViedma', 'fijoPatagones', 'fijoCruce', 'recargoPasajero'];
  const normalizado = { ...datos };
  camposNumericos.forEach((campo) => {
    if (normalizado[campo] !== undefined && normalizado[campo] !== '') {
      normalizado[campo] = parseFloat(normalizado[campo]);
    }
  });
  return normalizado;
}

/**
 * Guarda los cambios en la planilla (vía el script de Google). Se manda la
 * contraseña ACTUAL para que el propio script la valide de su lado — no
 * alcanza con haber pasado el chequeo en el navegador.
 *
 * IMPORTANTE: no se le agrega el header "Content-Type: application/json" a
 * propósito. Agregarlo dispara un chequeo previo (preflight) de CORS que
 * Google Apps Script no responde bien, y el pedido fallaría directamente.
 */
export async function guardarTarifas(cambios, claveActual) {
  try {
    const respuesta = await fetch(URL_CONFIG, {
      method: 'POST',
      body: JSON.stringify({ ...cambios, claveActual }),
    });
    return await respuesta.json(); // { ok: true } o { ok: false, error: '...' }
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor de configuración.' };
  }
}
