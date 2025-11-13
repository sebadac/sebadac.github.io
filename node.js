let Input = document.getElementById("PIN")
let elms = document.querySelectorAll("[id='toHide']")
let elms2 = document.querySelectorAll("[id='toShow']")
let Video = document.getElementById("theVideo")
let VideoActual = document.getElementById('videoActual')
let CloseBtn = document.getElementById("closeBtn")
let Folder = document.getElementById("Carpeta")

function showVideo(clicked_id){
    if (clicked_id === "vid1") {
        VideoActual.setAttribute("src" , "https://youtu.be/Y0U3_jalQyE?si=G0XjL1mzYwSiFScS")
    } else if (clicked_id === "vid2") {
        VideoActual.setAttribute("src", "VIDs/blu.mp4")
    } else if (clicked_id === "vid3") {
        VideoActual.setAttribute("src", "VIDs/bla.mp4")
    } else if (clicked_id === "vid4") {
        VideoActual.setAttribute("src", "VIDs/rickroll2.mp4")
    }

    Video.style.display = 'inline';
}

function showFolder(){
    Folder.style.display = "inline";
}

Input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        console.log(event.target.value)
        if (event.target.value === "2161"){
            for(var i = 0; i < elms.length; i++) 
            elms[i].style.display='none';
        
            for(var i = 0; i < elms2.length; i++) 
            elms2[i].style.display='block';
        }
    }
})

function closeFolder(){
    Folder.style.display = 'none';
}

function closeVideo(){
    Video.style.display = 'none'
}





document.getElementById('bin').addEventListener('click', function() {
    window.open(
        'rompecabezas.html',
        'Rompecabezas',
        'width=' + screen.width + ',height=' + screen.height
    );
});






function abrirRompecabezas() {
    const url = 'rompecabezas.html';

    const w = 1100; // Ancho que querés
    const h = 1000;  // Alto que querés

    // Centrado en pantalla
    const left = Math.round((screen.width - w) / 2);
    const top = Math.round((screen.height - h) / 4); // Ajuste para que quede más arriba

    const features = [
        'toolbar=no',
        'location=no',
        'status=no',
        'menubar=no',
        'scrollbars=yes',
        'resizable=yes',
        `width=${w}`,
        `height=${h}`,
        `left=${left}`,
        `top=${top}`
    ].join(',');

    const winName = 'RompecabezasWindow';
    const win = window.open(url, winName, features);

    if (!win) {
        alert('Permití ventanas emergentes (popups) para abrir el rompecabezas.');
    } else {
        win.focus();
    }

}


