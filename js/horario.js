/**
 * Indica si, según la hora actual del dispositivo del cliente y los horarios
 * configurados (formato "HH:MM", 24hs), el servicio está dentro de su
 * horario de atención. No bloquea nada por sí solo: es solo informativo.
 */
export function estaAbierto(tarifas, ahora = new Date()) {
  const minutosApertura = aMinutos(tarifas.horarioApertura);
  const minutosCierre = aMinutos(tarifas.horarioCierre);

  // Si no hay horarios configurados, no asumimos nada: se considera abierto.
  if (minutosApertura === null || minutosCierre === null) return true;

  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  if (minutosApertura <= minutosCierre) {
    return minutosAhora >= minutosApertura && minutosAhora < minutosCierre;
  }

  // Horario que cruza la medianoche (ej: abre 18:00, cierra 02:00).
  return minutosAhora >= minutosApertura || minutosAhora < minutosCierre;
}

function aMinutos(horaTexto) {
  if (!horaTexto || !horaTexto.includes(':')) return null;
  const [horas, minutos] = horaTexto.split(':').map(Number);
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
  return horas * 60 + minutos;
}
