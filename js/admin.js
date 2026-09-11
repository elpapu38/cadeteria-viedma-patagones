/**
 * Conecta el botón del panel (⚙️) con el modal de edición de tarifas,
 * horarios y contraseña. Los cambios se guardan en la planilla de Google
 * (no en este navegador), así le llegan a todos los visitantes.
 *
 * onGuardar(cambios, claveActual) se llama al guardar; debe devolver
 * (o resolver a) { ok: true } o { ok: false, error: '...' }.
 */
export function initAdmin({ tarifas, onGuardar }) {
  const btnAbrir = document.getElementById('btnAdmin');
  const modal = document.getElementById('modal-admin');
  const btnCerrar = document.getElementById('btn-cerrar-admin');
  const secLogin = document.getElementById('sec-login');
  const secPrecios = document.getElementById('sec-precios');
  const inputPass = document.getElementById('admin-pass');
  const btnLogin = document.getElementById('btn-login-admin');
  const btnGuardar = document.getElementById('btn-guardar-tarifas');

  const campos = {
    fijoViedma: document.getElementById('cfg-fijo-viedma'),
    fijoPatagones: document.getElementById('cfg-fijo-patagones'),
    fijoCruce: document.getElementById('cfg-fijo-cruce'),
    recargoPasajero: document.getElementById('cfg-pasajero'),
    horarioApertura: document.getElementById('cfg-horario-apertura'),
    horarioCierre: document.getElementById('cfg-horario-cierre'),
    nuevaClave: document.getElementById('cfg-nueva-clave'),
  };

  // Se guarda en memoria (no en el HTML) la clave con la que se hizo login,
  // para poder mandarla junto con los cambios al guardar.
  let claveIngresada = '';

  function abrir() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function cerrar() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    secLogin.classList.remove('hidden');
    secPrecios.classList.add('hidden');
    inputPass.value = '';
  }

  function mostrarFormularioDePrecios() {
    secLogin.classList.add('hidden');
    secPrecios.classList.remove('hidden');
    campos.fijoViedma.value = tarifas.fijoViedma;
    campos.fijoPatagones.value = tarifas.fijoPatagones;
    campos.fijoCruce.value = tarifas.fijoCruce;
    campos.recargoPasajero.value = tarifas.recargoPasajero;
    campos.horarioApertura.value = tarifas.horarioApertura || '';
    campos.horarioCierre.value = tarifas.horarioCierre || '';
    campos.nuevaClave.value = ''; // nunca se muestra la clave actual
  }

  btnAbrir.addEventListener('click', abrir);
  btnCerrar.addEventListener('click', cerrar);

  btnLogin.addEventListener('click', () => {
    if (inputPass.value === tarifas.claveAdmin) {
      claveIngresada = inputPass.value;
      mostrarFormularioDePrecios();
    } else {
      alert('Contraseña incorrecta');
    }
  });

  btnGuardar.addEventListener('click', async () => {
    const cambios = {
      fijoViedma: parseFloat(campos.fijoViedma.value) || 0,
      fijoPatagones: parseFloat(campos.fijoPatagones.value) || 0,
      fijoCruce: parseFloat(campos.fijoCruce.value) || 0,
      recargoPasajero: parseFloat(campos.recargoPasajero.value) || 0,
      horarioApertura: campos.horarioApertura.value || tarifas.horarioApertura,
      horarioCierre: campos.horarioCierre.value || tarifas.horarioCierre,
    };

    if (campos.nuevaClave.value.trim() !== '') {
      cambios.nuevaClave = campos.nuevaClave.value.trim();
    }

    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    const resultado = await onGuardar(cambios, claveIngresada);

    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar cambios';

    if (resultado && resultado.ok === false) {
      alert(resultado.error || 'No se pudo guardar. Probá de nuevo.');
      return; // se deja el modal abierto para reintentar
    }

    cerrar();
  });
}
