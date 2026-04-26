/* ================================================================
   1. CONFIGURACIÓN INICIAL (DATOS DEL EVENTO Y CONTACTO)
   ----------------------------------------------------------------
   Modifica estos valores para cada nueva invitación.
   ================================================================ */
const CONFIG = {
    telefonoWA: "595976987732", // Número sin el "+"
    fechaEvento: new Date(2026, 4, 21, 21, 0, 0), // (Año, Mes-1, Día, Hora, Min, Seg)
    nombreCumple: "Camila",
    lugarEvento: "Salón de Eventos La Elegancia, Av. Siempre Viva 123",
    urlGoogleForms: "https://docs.google.com/forms/d/e/1FAIpQLSdMbhT2dSPB1f3lrd6LIycj2_5k0-1zrK32esyTlzwDqWHXuw/formResponse"
};

/* ================================================================
   2. CAPTURA DE DATOS DE LA URL (?n=Nombre&p=3)
   ================================================================ */
const urlParams = new URLSearchParams(window.location.search);
const nombreInvitado = urlParams.get('n') || "Invitado Especial";
const pasesMaximos = parseInt(urlParams.get('p')) || 1;

// Inyectar datos en el HTML
document.getElementById('nombre-invitado').innerText = nombreInvitado;
document.getElementById('cantidad-pases').innerText = pasesMaximos;

/* ================================================================
   3. LÓGICA DEL REPRODUCTOR (ESTILO SPOTIFY)
   ================================================================ */
const cancion = document.getElementById("cancion");
const progreso = document.getElementById("progreso");
const ctrlIcono = document.querySelector(".boton-reproducir-pausar i");
const btnPlayPausa = document.querySelector(".boton-reproducir-pausar");

// Configurar barra de progreso
cancion.onloadedmetadata = () => {
    progreso.max = cancion.duration;
    progreso.value = cancion.currentTime;
};

function reproducirPausar() {
    if (cancion.paused) {
        cancion.play();
        ctrlIcono.className = "bi bi-pause-circle-fill";
    } else {
        cancion.pause();
        ctrlIcono.className = "bi bi-play-circle-fill";
    }
}

btnPlayPausa?.addEventListener("click", reproducirPausar);

// Actualizar barra automáticamente
cancion.addEventListener("timeupdate", () => {
    progreso.value = cancion.currentTime;
});

// Control manual del progreso
progreso.oninput = () => {
    cancion.currentTime = progreso.value;
    if (cancion.paused) reproducirPausar();
};

// Saltos de tiempo (10s)
document.querySelector(".atras").onclick = () => cancion.currentTime -= 10;
document.querySelector(".adelante").onclick = () => cancion.currentTime += 10;

/* ================================================================
   4. CONTADOR Y CALENDARIO
   ================================================================ */
const intervaloContador = setInterval(() => {
    const ahora = new Date().getTime();
    const distancia = CONFIG.fechaEvento.getTime() - ahora;

    const d = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const h = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("contador").innerHTML = `${d}d ${h}h ${m}m ${s}s`;

    if (distancia < 0) {
        clearInterval(intervaloContador);
        document.getElementById("contador").innerHTML = "¡HOY ES EL GRAN DÍA!";
    }
}, 1000);

function agregarAlCalendario() {
    const titulo = encodeURIComponent(`Mis 15 Años - ${CONFIG.nombreCumple}`);
    const detalles = encodeURIComponent("¡Te espero para celebrar juntos!");
    const lugar = encodeURIComponent(CONFIG.lugarEvento);
    
    // Formato YYYYMMDD para Google Calendar
    const f = CONFIG.fechaEvento.toISOString().replace(/-|:|\.\d+/g, "").split("T")[0];
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${f}/${f}&details=${detalles}&location=${lugar}`;
    
    window.open(url, '_blank');
}

/* ================================================================
   5. SISTEMA DE ASISTENCIA (GOOGLE FORMS + WHATSAPP)
   ================================================================ */

// Llenar el selector de pases dinámicamente
const selectPases = document.getElementById('pases-confirmados');
for (let i = 1; i <= pasesMaximos; i++) {
    let opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i + (i === 1 ? " Persona" : " Personas");
    selectPases.appendChild(opt);
}

// Verificar si ya confirmó anteriormente (LocalStorage)
window.addEventListener('load', () => {
    if (localStorage.getItem("asistencia_enviada") === "true") {
        const btnC = document.getElementById('btn-confirmar');
        if(btnC) btnC.innerHTML = '<i class="bi bi-check-all"></i> Ya confirmado';
        document.getElementById('btn-rechazar').style.display = 'none';
    }
});

async function confirmarAsistencia(asiste) {
    if (localStorage.getItem("asistencia_enviada") === "true") {
        document.getElementById('modal-duplicado').style.display = 'flex';
        return;
    }

    const seleccionados = selectPases.value;
    const asistenciaTexto = asiste ? "Confirmado" : "No asistirá";
    const cantidadFinal = asiste ? seleccionados : "0";
    
    // Envío a Google Forms
    const formData = new FormData();
    formData.append("entry.935626048", nombreInvitado);
    formData.append("entry.696412294", asistenciaTexto);
    formData.append("entry.278491890", cantidadFinal);

    fetch(CONFIG.urlForm, { method: "POST", mode: "no-cors", body: formData });

    localStorage.setItem("asistencia_enviada", "true");
    mostrarModal(asiste, seleccionados);
}

function mostrarModal(asiste, cant) {
    const modal = document.getElementById('modal-confirmacion');
    const mensaje = document.getElementById('modal-mensaje');
    modal.style.display = 'flex';

    mensaje.innerText = asiste 
        ? `¡Genial ${nombreInvitado}! Registramos ${cant} pases. Avisa a ${CONFIG.nombreCumple} por WhatsApp.` 
        : `Gracias por avisar, ${nombreInvitado}. Registramos que no podrás asistir.`;

    document.getElementById('btn-cerrar-modal').onclick = () => {
        let msgWA = asiste 
            ? `¡Hola! Soy ${nombreInvitado}. Confirmo mi asistencia para ${cant} personas.`
            : `¡Hola! Soy ${nombreInvitado}. Lamentablemente no podré asistir.`;
            
        window.open(`https://wa.me/${CONFIG.telefonoWA}?text=${encodeURIComponent(msgWA)}`, '_blank');
        modal.style.display = 'none';
    };
}

// Event Listeners
document.getElementById('btn-confirmar').addEventListener('click', () => confirmarAsistencia(true));
document.getElementById('btn-rechazar').addEventListener('click', () => confirmarAsistencia(false));
document.getElementById('btn-cerrar-duplicado').onclick = () => document.getElementById('modal-duplicado').style.display = 'none';