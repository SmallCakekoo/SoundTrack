// Importar el JSON de canciones
let canciones = [];
let cancionesAleatorias = []; // Añadido para almacenar las canciones aleatorias
let cancionesPlaylist = []; // Añadido para almacenar las canciones de la playlist

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

// Función para cargar las canciones aleatorias desde el JSON
async function cargarCancionesAleatorias() {
  try {
    const respuesta = await fetch("data/randomsongs.json");
    cancionesAleatorias = await respuesta.json();
    console.log("Canciones aleatorias cargadas:", cancionesAleatorias.length);
    return cancionesAleatorias;
  } catch (error) {
    console.error("Error al cargar el archivo de canciones aleatorias:", error);
    return [];
  }
}

// Función para cargar las canciones de la playlist desde el JSON
async function cargarPlaylist() {
  try {
    const respuesta = await fetch("data/playlist.json");
    cancionesPlaylist = await respuesta.json();
    console.log("Canciones de playlist cargadas:", cancionesPlaylist.length);
    return cancionesPlaylist;
  } catch (error) {
    console.error("Error al cargar el archivo de playlist:", error);
    return [];
  }
}

// Función para randomizar y mostrar canciones aleatorias en la sección "Descubre Aleatoriamente"
function mostrarCancionesAleatorias() {
  if (cancionesAleatorias.length === 0) {
    console.error("No hay canciones aleatorias disponibles");
    return;
  }

  // Obtener las memory cards
  const memoryCards = document.querySelectorAll(".memory-card");

  if (memoryCards.length === 0) {
    console.error("No se encontraron memory cards en la interfaz");
    return;
  }

  // Para cada memory card, seleccionar una canción aleatoria
  memoryCards.forEach((card) => {
    // Seleccionar una canción aleatoria
    const randomIndex = Math.floor(Math.random() * cancionesAleatorias.length);
    const cancion = cancionesAleatorias[randomIndex];

    // Actualizar los elementos de la tarjeta
    const vinylSong = card.querySelector(".vinyl-song");
    const vinylArtist = card.querySelector(".vinyl-artist");
    const memoryDescription = card.querySelector(".memory-description");
    const title = card.querySelector(".memory-title");

    if (vinylSong) vinylSong.textContent = cancion.cancion;
    if (vinylArtist) vinylArtist.textContent = cancion.artista;
    if (memoryDescription) memoryDescription.textContent = cancion.frase;
    if (title) title.textContent = cancion.titulo;

    // Configurar controles de reproducción
    const btnPlay = card.querySelector(".btn-play");
    if (btnPlay) {
      btnPlay.onclick = function () {
        // Si hay un audio reproduciéndose, pausarlo
        if (audioActual && !audioActual.paused) {
          audioActual.pause();
          // Mostrar todos los botones de play y ocultar los de pausa
          document
            .querySelectorAll(".btn-play")
            .forEach((btn) => (btn.style.display = "inline-block"));
          document
            .querySelectorAll(".btn-pause")
            .forEach((btn) => (btn.style.display = "none"));
        }

        // Reproducir la nueva canción
        audioActual = new Audio(cancion.url);
        audioActual.volume = 0.7;
        audioActual.play();

        // Mostrar el botón de pausa y ocultar el de play en esta tarjeta
        this.style.display = "none";
        const pauseBtn = card.querySelector(".btn-pause");
        if (pauseBtn) pauseBtn.style.display = "inline-block";

        // Configurar evento para cuando termine la canción
        audioActual.onended = function () {
          btnPlay.style.display = "inline-block";
          pauseBtn.style.display = "none";
        };
      };
    }

    // Configurar botón de pausa
    const btnPause = card.querySelector(".btn-pause");
    if (btnPause) {
      btnPause.style.display = "none"; // Ocultar inicialmente
      btnPause.onclick = function () {
        if (audioActual && !audioActual.paused) {
          audioActual.pause();
          this.style.display = "none";
          const playBtn = card.querySelector(".btn-play");
          if (playBtn) playBtn.style.display = "inline-block";
        }
      };
    }
  });

  console.log("Canciones aleatorias mostradas en la interfaz");
}

// Función para mostrar las canciones de la playlist en la sección "Mi Playlist Actual"
function mostrarPlaylist(aleatorizar = false) {
  if (cancionesPlaylist.length === 0) {
    console.error("No hay canciones en la playlist disponibles");
    return;
  }

  // Obtener el contenedor de la playlist
  const playlistContainer = document.querySelector(".playlist-container");

  if (!playlistContainer) {
    console.error("No se encontró el contenedor de la playlist en la interfaz");
    return;
  }

  // Limpiar el contenedor actual
  playlistContainer.innerHTML = "";

  // Si se debe aleatorizar, mezclamos el orden de las canciones
  let canciones = [...cancionesPlaylist];
  if (aleatorizar) {
    // Algoritmo Fisher-Yates para mezclar el array
    for (let i = canciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [canciones[i], canciones[j]] = [canciones[j], canciones[i]];
    }
    console.log("Playlist aleatorizada");
  }

  // Mostrar hasta 10 canciones de la playlist (o menos si no hay suficientes)
  const maxCanciones = Math.min(canciones.length, 10);

  for (let i = 0; i < maxCanciones; i++) {
    const cancion = canciones[i];
    const numeroFormatado = (i + 1).toString().padStart(2, "0");

    // Crear elemento de pista
    const trackElement = document.createElement("div");
    trackElement.className =
      "track animate__animated animate__fadeInUp animate__faster";
    trackElement.style.animationDelay = `0.${(i % 5) + 1}s`;

    // Añadir número de pista
    const trackNumber = document.createElement("span");
    trackNumber.className = "track-number";
    trackNumber.textContent = numeroFormatado;
    trackElement.appendChild(trackNumber);

    // Añadir información de la pista
    const trackInfo = document.createElement("div");
    trackInfo.className = "track-info";

    const trackTitle = document.createElement("h4");
    trackTitle.textContent = cancion.nombre_cancion;
    trackInfo.appendChild(trackTitle);

    const trackArtist = document.createElement("p");
    trackArtist.textContent = cancion.artista;
    trackInfo.appendChild(trackArtist);

    trackElement.appendChild(trackInfo);

    // Añadir duración
    const trackDuration = document.createElement("span");
    trackDuration.className = "track-duration";
    trackDuration.textContent = cancion.duracion;
    trackElement.appendChild(trackDuration);

    // Añadir botón de reproducción (invisible inicialmente)
    const playButton = document.createElement("button");
    playButton.className = "btn-play-track";
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.style.display = "none";
    trackElement.appendChild(playButton);

    // Configurar eventos
    trackElement.addEventListener("mouseover", function () {
      trackDuration.style.display = "none";
      playButton.style.display = "inline-block";
    });

    trackElement.addEventListener("mouseout", function () {
      trackDuration.style.display = "inline-block";
      playButton.style.display = "none";
    });

    // Configurar reproducción al hacer clic
    playButton.addEventListener("click", function (e) {
      e.stopPropagation();

      // Si hay otro audio reproduciéndose, pausarlo
      if (audioActual && !audioActual.paused) {
        audioActual.pause();
        // Restaurar los estilos de todas las pistas
        document.querySelectorAll(".track").forEach((track) => {
          track.classList.remove("playing");
        });
      }

      // Si ya está sonando esta canción, pausarla
      if (
        audioActual &&
        audioActual._trackElement === trackElement &&
        !audioActual.paused
      ) {
        audioActual.pause();
        trackElement.classList.remove("playing");
        this.innerHTML = '<i class="fas fa-play"></i>';
        return;
      }

      // Reproducir la canción
      audioActual = new Audio(cancion.enlace_cancion);
      audioActual._trackElement = trackElement;
      audioActual.volume = 0.7;

      // Marcar esta pista como reproduciendo
      trackElement.classList.add("playing");
      this.innerHTML = '<i class="fas fa-pause"></i>';

      // Configurar eventos del audio
      audioActual.onended = function () {
        trackElement.classList.remove("playing");
        playButton.innerHTML = '<i class="fas fa-play"></i>';
      };

      audioActual.play().catch((error) => {
        console.error("Error al reproducir:", error);
        trackElement.classList.remove("playing");
        playButton.innerHTML = '<i class="fas fa-play"></i>';
      });
    });

    // Añadir al contenedor
    playlistContainer.appendChild(trackElement);
  }

  console.log("Playlist mostrada en la interfaz");
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

    // Cargar y configurar canciones aleatorias
    await cargarCancionesAleatorias();
    mostrarCancionesAleatorias();

    // Configurar el botón de randomización
    const btnRandomize = document.querySelector(".btn-randomize");
    if (btnRandomize) {
      btnRandomize.addEventListener("click", mostrarCancionesAleatorias);
      console.log("Botón de randomización configurado");
    } else {
      console.error("No se encontró el botón de randomización");
    }

    // Cargar y mostrar playlist
    await cargarPlaylist();
    mostrarPlaylist();

    // Configurar el botón de aleatorización de playlist
    const btnRandomizePlaylist = document.querySelector(
      ".btn-randomize-playlist"
    );
    if (btnRandomizePlaylist) {
      btnRandomizePlaylist.addEventListener("click", function () {
        mostrarPlaylist(true); // Llamar a mostrarPlaylist con parámetro de aleatorización
      });
      console.log("Botón de aleatorización de playlist configurado");
    } else {
      console.error("No se encontró el botón de aleatorización de playlist");
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
