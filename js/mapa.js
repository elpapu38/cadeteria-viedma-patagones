// Centrado aproximado entre Viedma y Carmen de Patagones.
const CENTRO_INICIAL = [-40.808, -62.99];
const ZOOM_INICIAL = 13;

/**
 * Inicializa el mapa de Leaflet dentro de #mapa.
 * Primer clic marca el origen, segundo clic marca el destino.
 * Un tercer clic reinicia la selección y vuelve a marcar el origen.
 *
 * callbacks:
 *  - onOrigenSet({lat, lng, direccion})
 *  - onDestinoSet({lat, lng, direccion})
 *  - onReiniciar()
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
      const direccion = await obtenerDireccion(punto);
      onOrigenSet({ lat: punto.lat, lng: punto.lng, direccion });
      return;
    }

    if (!marcadorDestino) {
      marcadorDestino = L.marker(punto, { icon: iconoDestino }).addTo(mapa);
      const direccion = await obtenerDireccion(punto);
      onDestinoSet({ lat: punto.lat, lng: punto.lng, direccion });
      return;
    }

    // Ya había origen y destino marcados: se reinicia y este clic pasa a ser el nuevo origen.
    mapa.removeLayer(marcadorOrigen);
    mapa.removeLayer(marcadorDestino);
    marcadorDestino = null;
    marcadorOrigen = L.marker(punto, { icon: iconoOrigen }).addTo(mapa);
    onReiniciar();
    const direccion = await obtenerDireccion(punto);
    onOrigenSet({ lat: punto.lat, lng: punto.lng, direccion });
  });

  return mapa;
}

async function obtenerDireccion(latlng) {
  try {
    const respuesta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
    );
    const datos = await respuesta.json();
    const calle = datos.address?.road || datos.address?.pedestrian || 'Punto marcado en el mapa';
    const numero = datos.address?.house_number || '';
    return `${calle} ${numero}`.trim();
  } catch {
    return 'Punto marcado en el mapa';
  }
}
