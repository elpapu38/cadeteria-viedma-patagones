/**
 * Conecta el botón "Panel admin" con el modal de edición de tarifas.
 * onGuardar(tarifasActualizadas) se llama cuando el admin guarda cambios.
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
  };

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
  }

  btnAbrir.addEventListener('click', abrir);
  btnCerrar.addEventListener('click', cerrar);

  btnLogin.addEventListener('click', () => {
    if (inputPass.value === tarifas.claveAdmin) {
      mostrarFormularioDePrecios();
    } else {
      alert('Contraseña incorrecta');
    }
  });

  btnGuardar.addEventListener('click', () => {
    const actualizadas = {
      ...tarifas,
      fijoViedma: parseFloat(campos.fijoViedma.value) || 0,
      fijoPatagones: parseFloat(campos.fijoPatagones.value) || 0,
      fijoCruce: parseFloat(campos.fijoCruce.value) || 0,
      recargoPasajero: parseFloat(campos.recargoPasajero.value) || 0,
    };
    onGuardar(actualizadas);
    cerrar();
  });
}
