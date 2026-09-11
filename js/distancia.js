// Punto de referencia aproximado entre Viedma y Carmen de Patagones,
// usado tanto para centrar el mapa como para calcular la zona de cobertura.
export const CENTRO_ZONA = { lat: -40.808, lng: -62.99 };

const RADIO_COBERTURA_KM = 100;
const RADIO_TIERRA_KM = 6371;

/**
 * Distancia en línea recta entre dos coordenadas (fórmula de Haversine), en km.
 */
export function distanciaKm(a, b) {
  const dLat = gradosARadianes(b.lat - a.lat);
  const dLng = gradosARadianes(b.lng - a.lng);
  const lat1 = gradosARadianes(a.lat);
  const lat2 = gradosARadianes(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return RADIO_TIERRA_KM * 2 * Math.asin(Math.sqrt(h));
}

function gradosARadianes(grados) {
  return (grados * Math.PI) / 180;
}

/**
 * Indica si un punto {lat, lng} está dentro del radio de cobertura del
 * servicio (100 km desde el centro de la zona Viedma/Patagones).
 */
export function estaDentroDeCobertura(punto) {
  return distanciaKm(CENTRO_ZONA, punto) <= RADIO_COBERTURA_KM;
}
