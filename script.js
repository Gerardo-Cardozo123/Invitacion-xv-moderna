// ============================================================
// INVITACIÓN DIGITAL - script.js (versión corregida)
// Fixes aplicados:
//   #1 - AOS inicializado después del DOM (DOMContentLoaded)
//   #2 - window.onload reemplazado por lógica separada
//   #3 - timeupdate sin tercer argumento inválido
// ============================================================

// --- 1. CAPTURA DE DATOS DE LA URL ---
const urlParams = new URLSearchParams(window.location.search);
const nombre = urlParams.get('n') || "Invitado Especial";
const pases = urlParams.get('p') || "1";
const telefono = "595983742503";

// ✅ FIX #2: Toda la inicialización del DOM va en DOMContentLoaded
// Esto garantiza que AOS mida posiciones correctas DESPUÉS de que
// el DOM esté listo y modificado, evitando el scroll jank.
document.addEventListener('DOMContentLoaded', function () {

    // --- Mostrar nombre y pases desde la URL ---
    document.getElementById('nombre-invitado').innerText = nombre;
    document.getElementById('cantidad-pases').innerText = pases;

    // --- Llenar selector de pases ---
    const selectPases = document.getElementById('pases-confirmados');
    const pasesMax = parseInt(pases) || 1;

    for (let i = 1; i <= pasesMax; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = i + (i === 1 ? " Persona" : " Personas");
        selectPases.appendChild(opt);
    }

    // --- ✅ FIX #2: Lógica de estado del botón (antes en window.onload) ---
    inicializarEstadoConfirmacion();

    // --- Event Listeners de confirmación ---
    document.getElementById('btn-confirmar').addEventListener('click', () => confirmarAsistencia(true));
    document.getElementById('btn-rechazar').addEventListener('click', () => confirmarAsistencia(false));

    // --- Cerrar modal duplicado ---
    document.getElementById('btn-cerrar-duplicado').onclick = function () {
        document.getElementById('modal-duplicado').style.display = 'none';
    };

}); // Fin de DOMContentLoaded


// --- 2. LÓGICA DEL REPRODUCTOR ---
const cancion = document.getElementById("cancion");
const progreso = document.getElementById("progreso");
const ctrlIcono = document.querySelector(".boton-reproducir-pausar i");
const btnPlayPausa = document.querySelector(".boton-reproducir-pausar");

cancion.onloadedmetadata = function () {
    progreso.max = cancion.duration;
    progreso.value = cancion.currentTime;
};

function reproducirPausar() {
    if (cancion.paused) {
        cancion.play();
        ctrlIcono.classList.remove("bi-play-circle-fill");
        ctrlIcono.classList.add("bi-pause-circle-fill");
    } else {
        cancion.pause();
        ctrlIcono.classList.remove("bi-pause-circle-fill");
        ctrlIcono.classList.add("bi-play-circle-fill");
    }
}

btnPlayPausa.addEventListener("click", reproducirPausar);

// ✅ FIX #3: Removido el tercer argumento inválido (500)
// El tercer argumento de addEventListener debe ser boolean o un objeto
// de opciones ({capture, passive, once}). El valor 500 es truthy,
// lo que registraba el listener en fase de captura incorrectamente.
cancion.addEventListener("timeupdate", () => {
    progreso.value = cancion.currentTime;
});

progreso.oninput = function () {
    cancion.currentTime = progreso.value;
    if (cancion.paused) {
        reproducirPausar();
    }
};

document.querySelector(".atras").onclick = () => { cancion.currentTime -= 10; };
document.querySelector(".adelante").onclick = () => { cancion.currentTime += 10; };


// --- 3. LÓGICA DEL CONTADOR ---
const fechaEvento = new Date(2026, 4, 30, 19, 0, 0).getTime();

const intervalo = setInterval(function () {
    const ahora = new Date().getTime();
    const distancia = fechaEvento - ahora;

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("contador").innerHTML =
        dias + "d " + horas + "h " + minutos + "m " + segundos + "s ";

    if (distancia < 0) {
        clearInterval(intervalo);
        document.getElementById("contador").innerHTML = "¡HOY ES EL GRAN DÍA!";
    }
}, 1000);


// --- 4. CALENDARIO ---
function agregarAlCalendario() {
    const titulo = encodeURIComponent("Mis 15 Años - Camila");
    const detalles = encodeURIComponent("¡Te espero para celebrar juntos!");
    const lugar = encodeURIComponent("Club Deportivo Alemán, Camino Tilinski, Independencia 5350");
    const fechaEvento = "20260530";
    const fechaFin = "20260531";

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaEvento}/${fechaFin}&details=${detalles}&location=${lugar}`;
    window.open(url, '_blank');
}


// --- 5. LÓGICA DE CONFIRMACIÓN ---

// ✅ FIX #2: Extraído de window.onload a función separada
// Se llama desde DOMContentLoaded, garantizando orden correcto
function inicializarEstadoConfirmacion() {
    if (localStorage.getItem(`asistencia_${nombre}`) === "true") {
        const btnConfirmar = document.getElementById('btn-confirmar');
        const btnRechazar = document.getElementById('btn-rechazar');

        if (btnConfirmar) btnConfirmar.innerHTML = '<i class="bi bi-check-all"></i> Ya confirmado';
        if (btnRechazar) btnRechazar.style.display = 'none';
    }
}

async function confirmarAsistencia(asiste) {
    if (localStorage.getItem(`asistencia_${nombre}`) === "true") {
        const modalDuplicado = document.getElementById('modal-duplicado');
        modalDuplicado.style.display = 'flex';
        return;
    }

    const seleccionados = document.getElementById('pases-confirmados').value;
    const asistenciaTexto = asiste ? "Confirmado" : "No asistirá";
    const cantidadFinal = asiste ? seleccionados : "0";

    const urlForm = "https://docs.google.com/forms/d/e/1FAIpQLSdMbhT2dSPB1f3lrd6LIycj2_5k0-1zrK32esyTlzwDqWHXuw/formResponse";

    const formData = new FormData();
    formData.append("entry.935626048", nombre);
    formData.append("entry.696412294", asistenciaTexto);
    formData.append("entry.278491890", cantidadFinal);

    fetch(urlForm, {
        method: "POST",
        mode: "no-cors",
        body: formData
    });

    localStorage.setItem(`asistencia_${nombre}`, "true");
    mostrarModalConfirmacion(asiste, seleccionados);
}

function mostrarModalConfirmacion(asiste, cant) {
    const modal = document.getElementById('modal-confirmacion');
    const mensajeEtiqueta = document.getElementById('modal-mensaje');

    modal.style.display = 'flex';

    mensajeEtiqueta.innerText = asiste
        ? `¡Genial ${nombre}! Hemos registrado tus ${cant} pases. Haz clic abajo para avisar por WhatsApp.`
        : `Gracias por avisar ${nombre}. Hemos registrado que no podrás asistir.`;

    document.getElementById('btn-cerrar-modal').onclick = function () {
        let mensajeWA = asiste
            ? `¡Hola! Soy ${nombre}. Confirmo mi asistencia para ${cant} personas.`
            : `¡Hola! Soy ${nombre}. Lamentablemente no podré asistir.`;

        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWA)}`, '_blank');
        modal.style.display = 'none';
    };
}