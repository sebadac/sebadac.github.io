(function () {
  'use strict';

  // === CONFIG ===
  // Apps Script Web App URL (Deployment: Execute as "Me", Access "Anyone")
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz1tdHOBTYFa7_PRuRHHwGLidekEyBrDNNCqIlBt33lGzOTwNjiTDyGhOPjq-Vp1omr/exec';
  const MY_SITE = 'https://sebadac.github.io'; // optional

  // === DOM UTIL ===
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function showStatus(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = 'status' + (type ? ' ' + type : '');
  }

  // === DATA: alumnos.json -> tarjetas por departamento ===
  async function renderAlumnosPorDept() {
    const cont = qs('.departamentos');
    if (!cont) return;
    try {
      const url = new URL('alumnos.json', location.origin).href;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar alumnos.json: ' + res.status);
      const data = await res.json();
      const alumnos = data.alumnosSantucci || [];

      const porDept = alumnos.reduce((acc, a) => {
        (acc[a.departamento] ||= []).push(a);
        return acc;
      }, {});

      cont.innerHTML = '';
      Object.entries(porDept).forEach(([dept, miembros]) => {
        const d = document.createElement('div');
        d.className = 'departamento';

        const h2 = document.createElement('h2');
        h2.className = 'nombreDept';
        h2.textContent = dept;
        d.appendChild(h2);

        const list = document.createElement('div');
        list.className = 'miembros';

        miembros.forEach(m => {
          const full = `${m.nombre} ${m.apellido}`;
          const card = document.createElement('div');
          card.className = 'tarjeta';

          const img = document.createElement('img');
          img.alt = full;
          img.loading = 'lazy';
          img.src = m.foto || './img/placeholder.jpg';

          const p = document.createElement('p');
          p.textContent = m.nombre;

          card.appendChild(img);
          card.appendChild(p);
          list.appendChild(card);
        });

        d.appendChild(list);
        cont.appendChild(d);
      });
    } catch (err) {
      console.error('[alumnos]', err);
    }
  }

  function equalizeDeptTitles() {
    const hs = qsa('.departamento h2');
    if (!hs.length) return;
    hs.forEach(h => (h.style.height = 'auto'));
    const max = Math.max(...hs.map(h => h.offsetHeight || 0));
    hs.forEach(h => (h.style.height = `${max}px`));
  }

  // === MENU TOGGLE (global) ===
  window.toggleMenu = function () {
    const m = qs('.menu');
    if (m) m.classList.toggle('active');
  };

  // === FORM ===
  function readField(form, name) {
    const el = form.elements[name];
    if (!el) return '';
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      return (el.value || '').trim();
    }
    return (form[name]?.value || '').trim();
  }

  function validateRequired(formEl, outEl) {
    const nombre = readField(formEl, 'nombre');
    const apellido = readField(formEl, 'apellido');
    const curso = readField(formEl, 'curso');
    const escapeRoom = readField(formEl, 'escapeRoom') || qs('#escapeRoom')?.value || '';
    const fecha = readField(formEl, 'fecha');

    if (!nombre || !apellido || !curso || !escapeRoom || !fecha) {
      showStatus(outEl, 'Completá todos los campos obligatorios.', 'err');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const btn = qs('#btnEnviar');
    const out = qs('#status');

    if (!validateRequired(form, out)) return;

    const payload = new URLSearchParams({
      nombre: readField(form, 'nombre'),
      apellido: readField(form, 'apellido'),
      curso: readField(form, 'curso'),
      escapeRoom: readField(form, 'escapeRoom') || qs('#escapeRoom')?.value || '',
      fecha: readField(form, 'fecha'),
      observaciones: readField(form, 'observaciones') || readField(form, 'obs') || ''
    });

    if (btn) btn.disabled = true;
    showStatus(out, 'Enviando…');

    try {
      // no-cors avoids the CORS block from Apps Script when served on GitHub Pages
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: payload.toString()
      });

      // We cannot read the response in no-cors. Assume success if no exception.
      showStatus(out, 'Inscripción registrada. Gracias.', 'ok');
      form.reset();
    } catch (err) {
      console.error('[form submit]', err);
      showStatus(out, 'Error de red o CORS. Revisá configuración del Web App.', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  // === BOOT ===
  document.addEventListener('DOMContentLoaded', async () => {
    // alumnos grid (if present)
    await renderAlumnosPorDept();
    equalizeDeptTitles();
    window.addEventListener('resize', equalizeDeptTitles);

    // form (if present)
    const formEl = qs('#formInscripcion');
    if (formEl) formEl.addEventListener('submit', handleSubmit);
  });
})();
