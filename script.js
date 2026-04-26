// --- 1. CAPTURA DE DATOS DE LA URL ---
const urlParams = new URLSearchParams(window.location.search);
const nombre = urlParams.get('n') || "Santiago Cubas";
const pases = urlParams.get('p') || "1";
const telefono ="595976987732";
document.getElementById('nombre-invitado').innerText = nombre;
document.getElementById('cantidad-pases').innerText = pases;

// --- 2. LÓGICA DEL REPRODUCTOR (ESTILO SPOTIFY) ---
const cancion = document.getElementById("cancion");
const progreso = document.getElementById("progreso");
const ctrlIcono = document.querySelector(".boton-reproducir-pausar i");
const btnPlayPausa = document.querySelector(".boton-reproducir-pausar");

// Configurar la barra de progreso cuando cargue la canción
cancion.onloadedmetadata = function() {
    progreso.max = cancion.duration;
    progreso.value = cancion.currentTime;
};

// Función Play/Pausa
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

// Actualizar la barra de progreso automáticamente
if (cancion.play) {
    cancion.addEventListener("timeupdate", () => {
    progreso.value = cancion.currentTime;
    }, 500);
}

// Permitir al usuario mover la barra de progreso manualmente
progreso.oninput = function() {
    cancion.currentTime = progreso.value;
    // Si estaba en pausa, al mover la barra podrías querer que empiece a sonar
    if (cancion.paused) {
        reproducirPausar();
    }
};

// Botones de "Atrás" y "Adelante" (Saltar 10 segundos)
document.querySelector(".atras").onclick = () => {
    cancion.currentTime -= 10;
};

document.querySelector(".adelante").onclick = () => {
    cancion.currentTime += 10;
};


// --- 3. LÓGICA DEL CONTADOR ---
const fechaEvento = new Date(2026, 4, 21, 21, 0, 0).getTime(); // Mayo es 4

const intervalo = setInterval(function() {
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

function agregarAlCalendario() {
    const titulo = encodeURIComponent("Mis 15 Años - Camila");
    const detalles = encodeURIComponent("¡Te espero para celebrar juntos!");
    const lugar = encodeURIComponent("Salón de Eventos La Elegancia, Av. Siempre Viva 123");
    
    // Para eventos de todo el día usamos solo YYYYMMDD
    // El evento es el 21, la fecha de fin debe ser el 22 para que marque el día completo
    const fechaEvento = "20260521"; 
    const fechaFin = "20260522";

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaEvento}/${fechaFin}&details=${detalles}&location=${lugar}`;
    
    window.open(url, '_blank');
}

// 1. Llenar el selector basado en los pases de la URL
const selectPases = document.getElementById('pases-confirmados');
const pasesMax = parseInt(pases) || 1; // 'pases' viene de la URL que ya configuraste

for (let i = 1; i <= pasesMax; i++) {
    let opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i + (i === 1 ? " Persona" : " Personas");
    selectPases.appendChild(opt);
}

// Al cargar la página, verificamos el estado
window.onload = function() {
    if (localStorage.getItem("asistencia_enviada") === "true") {
        const btnConfirmar = document.getElementById('btn-confirmar');
        const btnRechazar = document.getElementById('btn-rechazar');
        
        if(btnConfirmar) btnConfirmar.innerHTML = '<i class="bi bi-check-all"></i> Ya confirmado';
        if(btnRechazar) btnRechazar.style.display = 'none'; // Ocultamos el de rechazar
    }
};

async function confirmarAsistencia(asiste) {
    // 1. Bloqueo de duplicados
    if (localStorage.getItem("asistencia_enviada") === "true") {
       const modalDuplicado = document.getElementById('modal-duplicado');
        modalDuplicado.style.display = 'flex'; // Muestra el modal
        
        // Configuramos el botón para cerrar este modal específico
        document.getElementById('btn-cerrar-duplicado').onclick = function() {
            modalDuplicado.style.display = 'none';
        };
        return; // Detiene la función
    }

    const seleccionados = document.getElementById('pases-confirmados').value;
    const asistenciaTexto = asiste ? "Confirmado" : "No asistirá";
    const cantidadFinal = asiste ? seleccionados : "0";
    
    const urlForm = "https://docs.google.com/forms/d/e/1FAIpQLSdMbhT2dSPB1f3lrd6LIycj2_5k0-1zrK32esyTlzwDqWHXuw/formResponse";

    const formData = new FormData();
    formData.append("entry.935626048", nombre);
    formData.append("entry.696412294", asistenciaTexto);
    formData.append("entry.278491890", cantidadFinal);

    // 2. Envío silencioso
    fetch(urlForm, {
        method: "POST",
        mode: "no-cors",
        body: formData
    });

    // 3. Marcamos como enviado en el navegador
    localStorage.setItem("asistencia_enviada", "true");

    // 4. LLAMAMOS AL MODAL (Él se encargará del resto)
    mostrarModalConfirmacion(asiste, seleccionados);
}

// Esta función es la que ahora controla el mensaje y el WhatsApp
function mostrarModalConfirmacion(asiste, cant) {
    const modal = document.getElementById('modal-confirmacion');
    const mensajeEitqueta = document.getElementById('modal-mensaje');
    
    // Mostramos el modal
    modal.style.display = 'flex';

    // Personalizamos el texto del modal
    mensajeEitqueta.innerText = asiste 
        ? `¡Genial ${nombre}! Hemos registrado tus ${cant} pases. Haz clic abajo para avisar por WhatsApp.` 
        : `Gracias por avisar ${nombre}. Hemos registrado que no podrás asistir.`;

    // El botón del modal es el ÚNICO que abre WhatsApp ahora
    document.getElementById('btn-cerrar-modal').onclick = function() {
        let mensajeWA = asiste 
            ? `¡Hola! Soy ${nombre}. Confirmo mi asistencia para ${cant} personas.`
            : `¡Hola! Soy ${nombre}. Lamentablemente no podré asistir.`;
            
        window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWA)}`, '_blank');
        modal.style.display = 'none'; // Cerramos el modal
    };
}

// Configurar los Event Listeners (Asegúrate de que los IDs coincidan con tu HTML)
document.getElementById('btn-confirmar').addEventListener('click', () => confirmarAsistencia(true));
document.getElementById('btn-rechazar').addEventListener('click', () => confirmarAsistencia(false));