// Importar el JSON de canciones
let canciones = [];

// Variable global para el reproductor de audio
let audioActual = null;

// Función para cargar las canciones desde el JSON local
async function cargarCanciones() {
  try {
    const respuesta = await fetch("services/songs.json");
    canciones = await respuesta.json();
    console.log("Canciones cargadas:", canciones.length);
    return canciones;
  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
    return [];
  }
}

// Función para mostrar una canción específica en la interfaz
function mostrarCancion(cancion) {
  try {
    const {
      id,
      name,
      artist,
      album,
      release_date,
      genre,
      description,
      preview_url,
      cover_url,
      seccion,
      posicion,
    } = cancion;

    // Mapear los nombres de sección del JSON a los IDs de sección en el HTML
    let seccionMapeada = seccion;
    if (seccion === "training") {
      seccionMapeada = "workout";
    } else if (seccion === "relax") {
      seccionMapeada = "relaxed";
    }

    console.log(
      `Mostrando canción: ${name} para la sección ${seccion} (mapeada a ${seccionMapeada})`
    );

    // Seleccionar los elementos del DOM correspondientes a la sección y posición
    const portadaElement = document.querySelector(
      `.${seccionMapeada}-image-${posicion}`
    );
    if (!portadaElement) {
      console.error(
        `No se encontró el elemento de portada para ${seccionMapeada}-image-${posicion}`
      );
      return;
    }

    // Actualizar la imagen de portada
    portadaElement.style.backgroundImage = `url('${cover_url}')`;

    // Obtener el elemento tarjeta padre
    const cardElement = portadaElement.closest(".flip-card");

    // Actualizar el título y artista en el frente de la tarjeta
    const contentElement = portadaElement.parentElement;
    const tituloElement = contentElement.querySelector("h3");
    const artistaElement = contentElement.querySelector("p");

    if (tituloElement) {
      tituloElement.textContent = name;
    }

    if (artistaElement) {
      artistaElement.textContent = artist;
    }

    // Actualizar la información en la parte trasera de la tarjeta si existe
    if (cardElement) {
      // Actualizar detalles en la parte trasera
      const songTitle = cardElement.querySelector(".song-title");
      const songArtist = cardElement.querySelector(".song-artist");
      const songAlbum = cardElement.querySelector(".song-album");
      const songRelease = cardElement.querySelector(".song-release");
      const songGenre = cardElement.querySelector(".song-genre");
      const songDescription = cardElement.querySelector(".song-description");

      if (songTitle) songTitle.textContent = name;
      if (songArtist) songArtist.textContent = artist;
      if (songAlbum) songAlbum.textContent = album;
      if (songRelease) songRelease.textContent = release_date;
      if (songGenre) songGenre.textContent = genre;
      if (songDescription) songDescription.textContent = description;
    }

    // Configurar el botón de reproducción
    const botonElement = contentElement.querySelector(`.${seccionMapeada}-btn`);
    if (!botonElement) {
      console.error(`No se encontró el botón para ${seccionMapeada}-btn`);
      return;
    }

    // Configurar el botón de reproducción con la URL de audio
    botonElement.disabled = false;
    botonElement.dataset.previewUrl = preview_url;
    botonElement.dataset.cancionNombre = name;

    // Asignar el evento de clic
    botonElement.onclick = function (e) {
      e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
      const audioUrl = this.dataset.previewUrl;
      const nombreCancion = this.dataset.cancionNombre;

      // Si hay otro audio reproduciéndose y NO es el mismo que queremos reproducir, pausarlo
      if (
        audioActual &&
        !audioActual.paused &&
        audioActual._botonActual !== this
      ) {
        audioActual.pause();
        // Encontrar todos los botones y restaurarlos excepto el actual
        document.querySelectorAll(".btn-mood").forEach((btn) => {
          if (btn !== this)
            btn.innerHTML =
              '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
        });
      }

      // Si ya hay un audio asignado a este botón
      if (audioActual && audioActual._botonActual === this) {
        // Si está reproduciendo, pausar
        if (!audioActual.paused) {
          audioActual.pause();
          this.innerHTML =
            '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
          console.log(`Reproducción de ${nombreCancion} pausada`);
          return;
        }
        // Si está pausado, reanudar
        else {
          const playPromise = audioActual.play();
          this.innerHTML = '<i class="fas fa-pause"></i>&nbsp;&nbsp;Pausar';
          console.log(`Reproducción de ${nombreCancion} reanudada`);

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error al reproducir:", error);
              this.innerHTML =
                '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
            });
          }
          return;
        }
      }

      // Es un audio nuevo, crear reproductor
      audioActual = new Audio(audioUrl);
      audioActual._botonActual = this; // Guardar referencia al botón actual

      // Configurar eventos
      audioActual.oncanplaythrough = () => {
        console.log(
          `Audio de ${nombreCancion} cargado y listo para reproducir`
        );
      };

      audioActual.onerror = (e) => {
        console.error(`Error al cargar el audio de ${nombreCancion}:`, e);
        this.innerHTML =
          '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
      };

      audioActual.onended = () => {
        this.innerHTML =
          '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
        console.log(`Reproducción de ${nombreCancion} finalizada`);
      };

      audioActual.volume = 0.7;

      // Intentar reproducir
      const playPromise = audioActual.play();
      this.innerHTML = '<i class="fas fa-pause"></i>&nbsp;&nbsp;Pausar';
      console.log(`Reproducción de ${nombreCancion} iniciada`);

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error(`Error al reproducir ${nombreCancion}:`, error);
          this.innerHTML =
            '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
        });
      }
    };

    console.log(
      `Canción ${name} configurada exitosamente en sección ${seccion} (mapeada a ${seccionMapeada})`
    );
  } catch (error) {
    console.error(`Error al mostrar la canción:`, error);
  }
}

// Función principal que inicializa la interfaz con las canciones
async function inicializarCanciones() {
  try {
    // Cargar canciones desde el JSON
    const cancionesData = await cargarCanciones();

    if (cancionesData.length === 0) {
      console.error("No se pudieron cargar las canciones");
      return;
    }

    // Mostrar cada canción en la interfaz
    for (const cancion of cancionesData) {
      mostrarCancion(cancion);
    }

    console.log("Todas las canciones han sido configuradas");
  } catch (error) {
    console.error("Error al inicializar canciones:", error);
  }
}

// Función para buscar canciones por emoción/sección
function buscarCancionesPorSeccion(seccion) {
  return canciones.filter((cancion) => cancion.seccion === seccion);
}

// Función para buscar una canción por ID
function buscarCancionPorId(id) {
  return canciones.find((cancion) => cancion.id === id);
}

// Ejecutar la inicialización cuando se carga la página
document.addEventListener("DOMContentLoaded", inicializarCanciones);

// Exportar funciones para uso externo si es necesario
window.buscarCancionesPorSeccion = buscarCancionesPorSeccion;
window.buscarCancionPorId = buscarCancionPorId;
