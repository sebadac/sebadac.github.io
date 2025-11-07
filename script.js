// Configuración del rompecabezas
const columns = 6;
const rows = 7;
const totalPieces = columns * rows;
let lockedCount = 0;

// Esperar a que el DOM esté listo
window.addEventListener('load', () => {
  const puzzleContainer = document.getElementById('puzzle');
  const finishButton = document.getElementById('finishButton');

  // Cargar la imagen base para el rompecabezas
  const img = new Image();
  img.src = 'rompecabezas.png';
  img.onload = () => {
    // Definir el tamaño del contenedor al tamaño de la imagen
    puzzleContainer.style.width = img.width + 'px';
    puzzleContainer.style.height = img.height + 'px';
console.log(img.height)
    // Calcular tamaño base de cada pieza (en píxeles)
    const baseWidth = Math.floor(img.width / columns);
    const baseHeight = Math.floor(img.height / rows);

    // Crear piezas cortando la imagen con canvas
    const pieces = [];
    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calcular ancho/alto de esta pieza (última fila/columna puede incluir el resto)
        const w = (col === columns - 1) ? (img.width - col * baseWidth) : baseWidth;
        const h = (row === rows - 1) ? (img.height - row * baseHeight) : baseHeight;
        
        // Dibujar la sección en un canvas auxiliar
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, col * baseWidth, row * baseHeight, w, h, 0, 0, w, h);
        
        // Crear elemento <img> con el trozo como fuente
        const piece = new Image();
        piece.src = canvas.toDataURL();
        piece.id = 'piece-' + index;
        piece.classList.add('piece');
        piece.draggable = true;
        piece.dataset.correct = index;  // posición correcta
        pieces.push(piece);
        index++;
      }
    }

    // Barajar piezas para colocarlas aleatoriamente
    const positions = Array.from(Array(totalPieces).keys());
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Asignar posición inicial a cada pieza y comprobar si ya está en su lugar
    pieces.forEach((piece, i) => {
      const pos = positions[i];
      piece.dataset.position = pos;
      // Calcular coordenadas según posición en grilla
      const targetRow = Math.floor(pos / columns);
      const targetCol = pos % columns;
      piece.style.top = (targetRow * baseHeight) + 'px';
      piece.style.left = (targetCol * baseWidth) + 'px';
      
      // Si la pieza ya está en su lugar correcto, se bloquea
      if (pos == piece.dataset.correct) {
        piece.draggable = false;
        piece.classList.add('locked');
        lockedCount++;
      }

      // Agregar eventos de drag & drop a la pieza
      piece.addEventListener('dragstart', dragStart);
      piece.addEventListener('dragover', dragOver);
      piece.addEventListener('drop', dropPiece);

      // Añadir al contenedor del puzzle
      puzzleContainer.appendChild(piece);
    });

    // Funciones de arrastre
    function dragStart(event) {
      // Guardar la id de la pieza arrastrada
      event.dataTransfer.setData('text/plain', event.target.id);
    }
    function dragOver(event) {
      event.preventDefault(); // Necesario para permitir drop
    }
    function dropPiece(event) {
      event.preventDefault();
      const target = event.target;
      const srcId = event.dataTransfer.getData('text/plain');
      const src = document.getElementById(srcId);
      // Validar que el drop sea en otra pieza no bloqueada
      if (!src || src === target || target.classList.contains('locked')) return;

      // Intercambiar posiciones
      const srcPos = parseInt(src.dataset.position);
      const tgtPos = parseInt(target.dataset.position);
      // Actualizar dataset
      src.dataset.position = tgtPos;
      target.dataset.position = srcPos;
      // Reubicar en el DOM según nuevo índice
      const srcRow = Math.floor(tgtPos / columns);
      const srcCol = tgtPos % columns;
      const tgtRow = Math.floor(srcPos / columns);
      const tgtCol = srcPos % columns;
      src.style.top = (srcRow * baseHeight) + 'px';
      src.style.left = (srcCol * baseWidth) + 'px';
      target.style.top = (tgtRow * baseHeight) + 'px';
      target.style.left = (tgtCol * baseWidth) + 'px';

      // Verificar si alguna pieza quedó en su sitio correcto tras el intercambio
      [src, target].forEach(piece => {
        if (piece.dataset.position == piece.dataset.correct) {
          piece.draggable = false;
          piece.classList.add('locked');
          lockedCount++;
        }
      });

      // Si todas las piezas están bloqueadas, mostrar botón de finalización
      if (lockedCount === totalPieces) {
        finishButton.style.display = 'block';
      }
    }
  };
});






// js/puzzle.js (ejemplo mínimo para probar)
window.addEventListener('load', () => {
  const canvas = document.getElementById('puzzleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto
  ctx.fillStyle = '#fff';
  ctx.font = '30px sans-serif';
  ctx.fillText('Aquí va tu rompecabezas', 50, 50);

  // Dibujo de prueba
  ctx.strokeStyle = '#888';
  for (let x = 0; x < canvas.width; x += 100) {
    for (let y = 0; y < canvas.height; y += 100) {
      ctx.strokeRect(x + 10, y + 10, 80, 80);
    }
  }
});






// // Al hacer clic en el botón verde, mostramos el contenedor de video
// document.getElementById('finishButton').addEventListener('click', function() {
//   document.getElementById('videoContainer').style.display = 'block';
//   // El video permanece pausado (no autoplay), esperando a que el usuario lo reproduzca.
// });

// // Al hacer clic en la "X", pausamos el video y lo ocultamos de nuevo
// document.getElementById('closeButton').addEventListener('click', function() {
//   var video = document.getElementById('myVideo');
//   video.pause();             // Detiene la reproducción:contentReference[oaicite:4]{index=4}
//   video.currentTime = 0;     // Opcional: reinicia al principio
//   document.getElementById('videoContainer').style.display = 'none';
// });






// Al hacer clic en la imagen (antes era un botón), mostramos el contenedor del video
document.getElementById('finishButton').addEventListener('click', function() {
  document.getElementById('videoContainer').style.display = 'block';
  // El video no se reproduce automáticamente
});

// Al hacer clic en la "X", pausamos y ocultamos el video
document.getElementById('closeButton').addEventListener('click', function() {
  const video = document.getElementById('myVideo');
  video.pause();
  video.currentTime = 0;  // Reinicia el video
  document.getElementById('videoContainer').style.display = 'none';
});



