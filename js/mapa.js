// Centrado aproximado entre Viedma y Carmen de Patagones.
const CENTRO_INICIAL = [-40.808, -62.99];
const ZOOM_INICIAL = 13;

/**
 * Inicializa el mapa de Leaflet dentro de #mapa.
 * Primer clic marca el origen, segundo clic marca el destino.
 * Un tercer clic reinicia la selección y vuelve a marcar el origen.
 *
 * callbacks:
 *  - onOrigenSet({lat, lng, direccion, zona})
 *  - onDestinoSet({lat, lng, direccion, zona})
 *  - onReiniciar()
 *
 * "zona" es 'viedma', 'patagones' o null si no se pudo determinar la ciudad
 * a partir de la geocodificación inversa (Nominatim).
 */
export function initMapa({ onOrigenSet, onDestinoSet, onReiniciar }) {
  const mapa = L.map('mapa').setView(CENTRO_INICIAL, ZOOM_INICIAL);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 18,
  }).addTo(mapa);

  const iconoOrigen = L.divIcon({ className: 'route-dot', iconSize: [14, 14] });
  const iconoDestino = L.divIcon({ className: 'route-dot end', iconSize: [14, 14] });

  let marcadorOrigen = null;
  let marcadorDestino = null;

  mapa.on('click', async (evento) => {
    const punto = evento.latlng;

    if (!marcadorOrigen) {
      marcadorOrigen = L.marker(punto, { icon: iconoOrigen }).addTo(mapa);
      const { direccion, zona } = await obtenerDireccion(punto);
      onOrigenSet({ lat: punto.lat, lng: punto.lng, direccion, zona });
      return;
    }

    if (!marcadorDestino) {
      marcadorDestino = L.marker(punto, { icon: iconoDestino }).addTo(mapa);
      const { direccion, zona } = await obtenerDireccion(punto);
      onDestinoSet({ lat: punto.lat, lng: punto.lng, direccion, zona });
      return;
    }

    // Ya había origen y destino marcados: se reinicia y este clic pasa a ser el nuevo origen.
    mapa.removeLayer(marcadorOrigen);
    mapa.removeLayer(marcadorDestino);
    marcadorDestino = null;
    marcadorOrigen = L.marker(punto, { icon: iconoOrigen }).addTo(mapa);
    onReiniciar();
    const { direccion, zona } = await obtenerDireccion(punto);
    onOrigenSet({ lat: punto.lat, lng: punto.lng, direccion, zona });
  });

  return mapa;
}

async function obtenerDireccion(latlng) {
  try {
    const respuesta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
    );
    const datos = await respuesta.json();
    return {
      direccion: formatearDireccion(datos.address),
      zona: detectarZona(datos.address),
    };
  } catch {
    return { direccion: 'Punto marcado en el mapa', zona: null };
  }
}

/**
 * Arma el texto de la dirección SIEMPRE incluyendo la localidad
 * (ej: "San Martín 450, Viedma"). Es necesario porque Viedma y Carmen de
 * Patagones comparten nombres de calle, así que mostrar solo "San Martín 450"
 * sería ambiguo para quien reciba el pedido.
 */
function formatearDireccion(address = {}) {
  const calle = address.road || address.pedestrian || 'Punto marcado en el mapa';
  const numero = address.house_number ? ` ${address.house_number}` : '';
  const localidad = address.city || address.town || address.village || address.municipality || '';
  const base = `${calle}${numero}`.trim();
  return localidad ? `${base}, ${localidad}` : base;
}

/**
 * Determina si el punto cae en Viedma o en Carmen de Patagones a partir de
 * los campos de localidad que devuelve Nominatim. Devuelve null si no
 * aparece ninguna de las dos (zona rural, error del servicio, etc.) — en
 * ese caso el sistema no debe asumir nada y hay que dejar que se revise a mano.
 */
function detectarZona(address = {}) {
  const texto = [address.city, address.town, address.village, address.municipality, address.county]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (texto.includes('patagones')) return 'patagones';
  if (texto.includes('viedma')) return 'viedma';
  return null;
}
