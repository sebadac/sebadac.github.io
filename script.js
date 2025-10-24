
// script.js
async function main() {
  const cont = document.querySelector(".departamentos");
  if (!cont) return;

  // Leer JSON
  const data = await fetch("alumnos.json").then(r => r.json());
  const alumnos = data.alumnosSantucci || [];

  // Agrupar por departamento
  const porDept = alumnos.reduce((acc, a) => {
    (acc[a.departamento] ||= []).push(a);
    return acc;
  }, {});

  cont.innerHTML = "";
  Object.entries(porDept).forEach(([dept, miembros]) => {
    const d = document.createElement("div");
    d.className = "departamento";

    const h2 = document.createElement("h2");
    h2.textContent = dept;
    h2.className = "nombreDept";
    d.appendChild(h2);

    const list = document.createElement("div");
    list.className = "miembros";

    miembros.forEach(m => {
      const full = `${m.nombre} ${m.apellido}`;
      const card = document.createElement("div");
      card.className = "tarjeta";

      const img = document.createElement("img");
      img.alt = full;
      img.src = m.foto || "./img/placeholder.jpg";

      const p = document.createElement("p");
      p.textContent = m.nombre;

      card.appendChild(img);
      card.appendChild(p);
      list.appendChild(card);
    });

    d.appendChild(list);
    cont.appendChild(d);
  });
}

function equalizeDeptTitles() {
  const hs = Array.from(document.querySelectorAll('.departamento h2'));
  hs.forEach(h => (h.style.height = 'auto'));              // reset
  const max = Math.max(...hs.map(h => h.offsetHeight));    // alto mayor
  hs.forEach(h => (h.style.height = `${max}px`));          // fijar todos
}

// llama después de crear las tarjetas
document.addEventListener('DOMContentLoaded', () => {
  main().then(() => {
    equalizeDeptTitles();
    window.addEventListener('resize', equalizeDeptTitles);
  });
});


function toggleMenu() {
  document.querySelector(".menu")?.classList.toggle("active");
}

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdRkvBmMOtodKXwbJd0Bb2jJuN9OnLwdOf-jKnMldB2zpTNJ1pdRAjd1uzqGPihOsV/exec"; // TODO

const form = document.getElementById('formInscripcion');
const btn  = document.getElementById('btnEnviar');
const out  = document.getElementById('status');

function validate(form){
  // Lecturas robustas por si algún name/id cambió
  const nombre      = (form.nombre?.value ?? form.elements['nombre']?.value ?? '').trim();
  const apellido    = (form.apellido?.value ?? form.elements['apellido']?.value ?? '').trim();
  const curso       = (form.curso?.value ?? form.elements['curso']?.value ?? '').trim();
  const escapeRoom  = (form.escapeRoom?.value ?? form.elements['escapeRoom']?.value ?? document.querySelector('#escapeRoom')?.value ?? '').trim();
  const fecha       = (form.fecha?.value ?? form.elements['fecha']?.value ?? '').trim();

  if (!nombre || !apellido || !curso || !escapeRoom || !fecha) {
    out.textContent = 'Completá todos los campos obligatorios.';
    out.className = 'status err';
    return false;
  }
  return true;
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if(!validate(form)) return;

  // Ensamblar valores con la misma lectura robusta
  const nombre      = (form.nombre?.value ?? form.elements['nombre']?.value ?? '').trim();
  const apellido    = (form.apellido?.value ?? form.elements['apellido']?.value ?? '').trim();
  const curso       = (form.curso?.value ?? form.elements['curso']?.value ?? '').trim();
  const escapeRoom  = (form.escapeRoom?.value ?? form.elements['escapeRoom']?.value ?? document.querySelector('#escapeRoom')?.value ?? '').trim();
  const fecha       = (form.fecha?.value ?? form.elements['fecha']?.value ?? '').trim();
  const observaciones = (form.obs?.value ?? form.elements['obs']?.value ?? '').trim();

  // Enviar como x-www-form-urlencoded (evita preflight CORS)
  const params = new URLSearchParams({
    nombre, apellido, curso, escapeRoom, fecha, observaciones
  });

  // DEBUG opcional en consola
  console.log('Payload a enviar:', Object.fromEntries(params));

  btn.disabled = true;
  out.textContent = 'Enviando…';
  out.className = 'status';

  try{
    const res = await fetch(SCRIPT_URL, { method: 'POST', body: params });

    let ok = false, data = null;
    if (res.type === 'opaque') {
      ok = true;
    } else if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
        ok = data && data.status === 'ok';
      } else {
        const txt = await res.text();
        ok = /\"status\"\\s*:\\s*\"ok\"/i.test(txt) || res.ok;
      }
    }

    if (ok) {
      out.textContent = 'Inscripción registrada. ¡Gracias!';
      out.className = 'status ok';
      form.reset();
    } else {
      throw new Error(data?.message || 'Respuesta inesperada');
    }
  }catch(err){
    console.error(err);
    out.textContent = 'Hubo un problema al registrar. Intentá de nuevo.';
    out.className = 'status err';
  }finally{
    btn.disabled = false;
  }
});






