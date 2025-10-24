(function () {
  'use strict';

  // === CONFIG ===
  // Reemplazá con la URL de tu Web App (Google Apps Script) desplegado como "Execute as: Me".
  // Ej: "https://script.google.com/macros/s/AKfycbx.../exec"
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1tdHOBTYFa7_PRuRHHwGLidekEyBrDNNCqIlBt33lGzOTwNjiTDyGhOPjq-Vp1omr/exec';

  // (Opcional) tu dominio de GitHub Pages — usado para diagnósticos y rutas absolutas si lo necesitás.
  const MY_SITE = 'https://sebadac.github.io';

  // ======= DOM UTIL =======
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function showStatus(el, msg, type) {
    if (!el) return console.log('status:', msg);
    el.textContent = msg;
    el.className = 'status' + (type ? ' ' + type : '');
  }

  // ======= MAIN: cargar tarjetas de alumnos =======
  async function main() {
    const cont = qs('.departamentos');
    if (!cont) return;

    try {
      // fetch relativo funcionará correctamente en GitHub Pages (root del sitio cuando repo = username.github.io)
      const url = new URL('alumnos.json', location.origin).href; // ejemplo: https://sebadac.github.io/alumnos.json
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo cargar alumnos.json: ' + res.status);
      const data = await res.json();
      const alumnos = data.alumnosSantucci || [];

      const porDept = alumnos.reduce((acc, a) => { (acc[a.departamento] ||= []).push(a); return acc; }, {});

      cont.innerHTML = '';
      Object.entries(porDept).forEach(([dept, miembros]) => {
        const d = document.createElement('div'); d.className = 'departamento';

        const h2 = document.createElement('h2'); h2.textContent = dept; h2.className = 'nombreDept'; d.appendChild(h2);

        const list = document.createElement('div'); list.className = 'miembros';

        miembros.forEach(m => {
          const full = `${m.nombre} ${m.apellido}`;
          const card = document.createElement('div'); card.className = 'tarjeta';

          const img = document.createElement('img'); img.alt = full; img.src = m.foto || './img/placeholder.jpg';
          const p = document.createElement('p'); p.textContent = m.nombre;

          card.appendChild(img); card.appendChild(p); list.appendChild(card);
        });

        d.appendChild(list); cont.appendChild(d);
      });

    } catch (err) {
      console.error(err);
    }
  }

  // ====== UTIL visual ======
  function equalizeDeptTitles() {
    const hs = qsa('.departamento h2');
    if (!hs.length) return;
    hs.forEach(h => (h.style.height = 'auto'));
    const max = Math.max(...hs.map(h => h.offsetHeight || 0));
    hs.forEach(h => (h.style.height = `${max}px`));
  }

  document.addEventListener('DOMContentLoaded', () => {
    main().then(() => {
      equalizeDeptTitles();
      window.addEventListener('resize', equalizeDeptTitles);
    });
  });

  // ===== MENU =====
  window.toggleMenu = function () { qs('.menu')?.classList.toggle('active'); };

  // ===== Inscripción: manejo del form =====
  const form = qs('#formInscripcion');
  const btn = qs('#btnEnviar');
  const out = qs('#status');

  function readField(form, name) {
    return (form[name]?.value ?? form.elements[name]?.value ?? '').trim();
  }

  function validate(formEl) {
    if (!formEl) return false;
    const nombre = readField(formEl, 'nombre');
    const apellido = readField(formEl, 'apellido');
    const curso = readField(formEl, 'curso');
    const escapeRoom = readField(formEl, 'escapeRoom') || qs('#escapeRoom')?.value || '';
    const fecha = readField(formEl, 'fecha');

    if (!nombre || !apellido || !curso || !escapeRoom || !fecha) {
      showStatus(out, 'Completá todos los campos obligatorios.', 'err');
      return false;
    }
    return true;
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(form)) return;

      const nombre = readField(form, 'nombre');
      const apellido = readField(form, 'apellido');
      const curso = readField(form, 'curso');
      const escapeRoom = readField(form, 'escapeRoom') || qs('#escapeRoom')?.value || '';
      const fecha = readField(form, 'fecha');
      const observaciones = readField(form, 'obs') || readField(form, 'observaciones') || '';

      const params = new URLSearchParams({ nombre, apellido, curso, escapeRoom, fecha, observaciones });

      console.log('Payload a enviar:', Object.fromEntries(params.entries()));

      btn.disabled = true;
      showStatus(out, 'Enviando…');

      try {
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          // No incluir credentials (cookies) en este caso
          credentials: 'omit',
          headers: {
            // importante: application/x-www-form-urlencoded evita preflight en la mayoría de casos
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: params.toString()
        });

        // Diagnóstico: si la respuesta es opaqua (mode/cors + CORS bloqueado) -> res.type === 'opaque'
        if (res.type === 'opaque') {
          // La petición pudo haber llegado al servidor pero la respuesta no es legible desde el navegador
          showStatus(out, 'Petición enviada pero la respuesta es opaca. Revisá CORS y el despliegue del Web App.', 'err');
          console.warn('Opaque response. Si usás Apps Script: asegurate de desplegar "Execute as: Me" y "Who has access: Anyone".');
          return;
        }

        const ct = res.headers.get('content-type') || '';
        let data = null;
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          const txt = await res.text();
          try { data = JSON.parse(txt); } catch (e) { data = { raw: txt }; }
        }

        // Manejo de respuesta esperada
        if ((data && data.status === 'ok') || res.ok) {
          showStatus(out, 'Inscripción registrada. ¡Gracias!', 'ok');
          form.reset();
        } else {
          // Mensaje detallado para debugging
          const msg = data?.message || data?.raw || `HTTP ${res.status} ${res.statusText}`;
          console.error('Registro falló:', msg, data);
          showStatus(out, 'Hubo un problema al registrar. ' + (msg ? msg : ''), 'err');
        }

      } catch (err) {
        console.error('Fetch error:', err);
        // Detectar errores relacionados a CORS (mensaje genérico en consola del navegador)
        showStatus(out, 'Error de red o CORS. Revisá consola devtools y la configuración del Web App.', 'err');
      } finally {
        btn.disabled = false;
      }

    });
  } else {
    // Si no hay formulario en la página, no hacemos nada pero avisamos en consola.
    console.info('No se encontró #formInscripcion - formulario de inscripción inactivo en esta página.');
  }

})();
