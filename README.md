# Cruce Directo — Cadetería y Moto-Viajes (Viedma / Carmen de Patagones)

MVP estático de costo $0/mes. Sin backend, sin base de datos: las tarifas se
guardan en el navegador (localStorage) y los pedidos se envían por WhatsApp.

## Estructura

```
index.html          Estructura de la página
css/styles.css       Estilos (paleta, chips, mapa, modal)
js/config.js         Tarifas por defecto + guardado en localStorage
js/state.js          Estado del pedido actual
js/mapa.js           Mapa (Leaflet) + geocodificación inversa (Nominatim)
js/cotizador.js       Cálculo del precio (siempre tarifa fija por recorrido)
js/admin.js          Modal de administración de tarifas
js/whatsapp.js        Armado y envío del mensaje de WhatsApp
js/main.js           Conecta todos los módulos
```

## Antes de publicar

1. En `js/whatsapp.js`, reemplazar `NUMERO_WHATSAPP` por el número real
   (código de país + número, sin espacios ni "+". Ej: `5492920123456`).
2. En `js/config.js`, cambiar `claveAdmin` por una contraseña propia, y
   ajustar las tarifas iniciales si hace falta (después se pueden editar
   igual desde el Panel admin sin tocar el código).
3. En el modal de admin (`index.html`), reemplazar el alias de ejemplo
   (`cruce.directo.mp`) y el titular por los datos reales de Mercado Pago.

## Probar en local (Laragon)

Los archivos `.js` usan módulos ES (`type="module"`), que **no funcionan**
abriendo `index.html` con doble clic (`file://`) por una restricción de
CORS del navegador. Hay que servirlos con un servidor, aunque sea local:

- Con Laragon: colocar la carpeta del proyecto dentro de `www/` y abrir
  `http://localhost/cadeteria-viedma-patagones/` desde el navegador.

## Publicar gratis en GitHub Pages

1. Crear un repositorio nuevo y vacío en GitHub (público).
2. Desde esta carpeta, en la terminal:
   ```bash
   git init
   git add .
   git commit -m "Primera versión del sitio"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy
   from a branch → Branch: `main` / `/(root)`** → Save.
4. En un par de minutos el sitio queda publicado en:
   `https://<tu-usuario>.github.io/<tu-repo>/`

Como todas las rutas del proyecto son relativas (`css/styles.css`,
`js/main.js`, etc.), funciona igual en la raíz de un dominio propio que
en una subcarpeta como la de GitHub Pages — no hace falta tocar nada.

## Actualizar el sitio más adelante

Cada vez que se cambie algo:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```
GitHub Pages vuelve a publicar solo, sin pasos extra.
