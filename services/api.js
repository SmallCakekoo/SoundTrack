let canciones = [];
let cancionesAleatorias = [];
let cancionesPlaylist = [];

let audioActual = null;

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

function mostrarCancionesAleatorias() {
  if (cancionesAleatorias.length === 0) {
    console.error("No hay canciones aleatorias disponibles");
    return;
  }

  const memoryCards = document.querySelectorAll(".memory-card");

  if (memoryCards.length === 0) {
    console.error("No se encontraron memory cards en la interfaz");
    return;
  }

  memoryCards.forEach((card) => {
    const randomIndex = Math.floor(Math.random() * cancionesAleatorias.length);
    const cancion = cancionesAleatorias[randomIndex];

    const vinylSong = card.querySelector(".vinyl-song");
    const vinylArtist = card.querySelector(".vinyl-artist");
    const memoryDescription = card.querySelector(".memory-description");
    const title = card.querySelector(".memory-title");

    if (vinylSong) vinylSong.textContent = cancion.cancion;
    if (vinylArtist) vinylArtist.textContent = cancion.artista;
    if (memoryDescription) memoryDescription.textContent = cancion.frase;
    if (title) title.textContent = cancion.titulo;

    const btnPlay = card.querySelector(".btn-play");
    if (btnPlay) {
      btnPlay.onclick = function () {
        if (audioActual && !audioActual.paused) {
          audioActual.pause();

          document
            .querySelectorAll(".btn-play")
            .forEach((btn) => (btn.style.display = "inline-block"));
          document
            .querySelectorAll(".btn-pause")
            .forEach((btn) => (btn.style.display = "none"));
        }

        audioActual = new Audio(cancion.url);
        audioActual.volume = 0.7;
        audioActual.play();

        this.style.display = "none";
        const pauseBtn = card.querySelector(".btn-pause");
        if (pauseBtn) pauseBtn.style.display = "inline-block";

        audioActual.onended = function () {
          btnPlay.style.display = "inline-block";
          pauseBtn.style.display = "none";
        };
      };
    }

    const btnPause = card.querySelector(".btn-pause");
    if (btnPause) {
      btnPause.style.display = "none";
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

function mostrarPlaylist(aleatorizar = false) {
  if (cancionesPlaylist.length === 0) {
    console.error("No hay canciones en la playlist disponibles");
    return;
  }

  const playlistContainer = document.querySelector(".playlist-container");

  if (!playlistContainer) {
    console.error("No se encontró el contenedor de la playlist en la interfaz");
    return;
  }

  playlistContainer.innerHTML = "";

  let canciones = [...cancionesPlaylist];
  if (aleatorizar) {
    for (let i = canciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [canciones[i], canciones[j]] = [canciones[j], canciones[i]];
    }
    console.log("Playlist aleatorizada");
  }

  const maxCanciones = Math.min(canciones.length, 10);

  for (let i = 0; i < maxCanciones; i++) {
    const cancion = canciones[i];
    const numeroFormatado = (i + 1).toString().padStart(2, "0");

    const trackElement = document.createElement("div");
    trackElement.className =
      "track animate__animated animate__fadeInUp animate__faster";
    trackElement.style.animationDelay = `0.${(i % 5) + 1}s`;

    const trackNumber = document.createElement("span");
    trackNumber.className = "track-number";
    trackNumber.textContent = numeroFormatado;
    trackElement.appendChild(trackNumber);

    const trackInfo = document.createElement("div");
    trackInfo.className = "track-info";

    const trackTitle = document.createElement("h4");
    trackTitle.textContent = cancion.nombre_cancion;
    trackInfo.appendChild(trackTitle);

    const trackArtist = document.createElement("p");
    trackArtist.textContent = cancion.artista;
    trackInfo.appendChild(trackArtist);

    trackElement.appendChild(trackInfo);

    const trackDuration = document.createElement("span");
    trackDuration.className = "track-duration";
    trackDuration.textContent = cancion.duracion;
    trackElement.appendChild(trackDuration);

    const playButton = document.createElement("button");
    playButton.className = "btn-play-track";
    playButton.innerHTML = '<i class="fas fa-play"></i>';
    playButton.style.display = "none";
    trackElement.appendChild(playButton);

    const pauseButton = document.createElement("button");
    pauseButton.className = "btn-pause-track";
    pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    pauseButton.style.display = "none";
    trackElement.appendChild(pauseButton);

    trackElement.addEventListener("mouseover", function () {
      if (!trackElement.classList.contains("playing")) {
        trackDuration.style.display = "none";
        playButton.style.display = "inline-block";
      }
    });

    trackElement.addEventListener("mouseout", function () {
      if (!trackElement.classList.contains("playing")) {
        trackDuration.style.display = "inline-block";
        playButton.style.display = "none";
      }
    });

    playButton.addEventListener("click", function (e) {
      e.stopPropagation();

      if (audioActual && !audioActual.paused) {
        document.querySelectorAll(".track").forEach((track) => {
          track.classList.remove("playing");
          const playBtn = track.querySelector(".btn-play-track");
          const pauseBtn = track.querySelector(".btn-pause-track");
          const duration = track.querySelector(".track-duration");

          if (playBtn) playBtn.style.display = "none";
          if (pauseBtn) pauseBtn.style.display = "none";
          if (duration) duration.style.display = "inline-block";
        });

        audioActual.pause();
      }

      audioActual = new Audio(cancion.enlace_cancion);
      audioActual._trackElement = trackElement;
      audioActual.volume = 0.7;

      trackElement.classList.add("playing");

      playButton.style.display = "none";
      pauseButton.style.display = "inline-block";
      trackDuration.style.display = "none";

      audioActual.onended = function () {
        trackElement.classList.remove("playing");
        pauseButton.style.display = "none";
        playButton.style.display = "none";
        trackDuration.style.display = "inline-block";
      };

      audioActual.play().catch((error) => {
        console.error("Error al reproducir:", error);
        trackElement.classList.remove("playing");
        pauseButton.style.display = "none";
        playButton.style.display = "none";
        trackDuration.style.display = "inline-block";
      });
    });

    pauseButton.addEventListener("click", function (e) {
      e.stopPropagation();

      if (audioActual && !audioActual.paused) {
        audioActual.pause();

        trackElement.classList.remove("playing");

        pauseButton.style.display = "none";
        playButton.style.display = "inline-block";
      }
    });

    playlistContainer.appendChild(trackElement);
  }

  console.log("Playlist mostrada en la interfaz");
}

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

    let seccionMapeada = seccion;
    if (seccion === "training") {
      seccionMapeada = "workout";
    } else if (seccion === "relax") {
      seccionMapeada = "relaxed";
    }

    console.log(
      `Mostrando canción: ${name} para la sección ${seccion} (mapeada a ${seccionMapeada})`
    );

    const portadaElement = document.querySelector(
      `.${seccionMapeada}-image-${posicion}`
    );
    if (!portadaElement) {
      console.error(
        `No se encontró el elemento de portada para ${seccionMapeada}-image-${posicion}`
      );
      return;
    }

    portadaElement.style.backgroundImage = `url('${cover_url}')`;

    const cardElement = portadaElement.closest(".flip-card");

    const contentElement = portadaElement.parentElement;
    const tituloElement = contentElement.querySelector("h3");
    const artistaElement = contentElement.querySelector("p");

    if (tituloElement) {
      tituloElement.textContent = name;
    }

    if (artistaElement) {
      artistaElement.textContent = artist;
    }

    if (cardElement) {
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

    const botonElement = contentElement.querySelector(`.${seccionMapeada}-btn`);
    if (!botonElement) {
      console.error(`No se encontró el botón para ${seccionMapeada}-btn`);
      return;
    }

    botonElement.disabled = false;
    botonElement.dataset.previewUrl = preview_url;
    botonElement.dataset.cancionNombre = name;

    botonElement.onclick = function (e) {
      e.stopPropagation();
      const audioUrl = this.dataset.previewUrl;
      const nombreCancion = this.dataset.cancionNombre;

      if (
        audioActual &&
        !audioActual.paused &&
        audioActual._botonActual !== this
      ) {
        audioActual.pause();

        document.querySelectorAll(".btn-mood").forEach((btn) => {
          if (btn !== this)
            btn.innerHTML =
              '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
        });
      }

      if (audioActual && audioActual._botonActual === this) {
        if (!audioActual.paused) {
          audioActual.pause();
          this.innerHTML =
            '<i class="fas fa-headphones"></i>&nbsp;&nbsp;Escuchar';
          console.log(`Reproducción de ${nombreCancion} pausada`);
          return;
        } else {
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

      audioActual = new Audio(audioUrl);
      audioActual._botonActual = this;

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

async function inicializarCanciones() {
  try {
    const cancionesData = await cargarCanciones();

    if (cancionesData.length === 0) {
      console.error("No se pudieron cargar las canciones");
      return;
    }

    for (const cancion of cancionesData) {
      mostrarCancion(cancion);
    }

    await cargarCancionesAleatorias();
    mostrarCancionesAleatorias();

    const btnRandomize = document.querySelector(".btn-randomize");
    if (btnRandomize) {
      btnRandomize.addEventListener("click", mostrarCancionesAleatorias);
      console.log("Botón de randomización configurado");
    } else {
      console.error("No se encontró el botón de randomización");
    }

    await cargarPlaylist();
    mostrarPlaylist();

    const btnRandomizePlaylist = document.querySelector(
      ".btn-randomize-playlist"
    );
    if (btnRandomizePlaylist) {
      btnRandomizePlaylist.addEventListener("click", function () {
        mostrarPlaylist(true);
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

function buscarCancionesPorSeccion(seccion) {
  return canciones.filter((cancion) => cancion.seccion === seccion);
}

function buscarCancionPorId(id) {
  return canciones.find((cancion) => cancion.id === id);
}

document.addEventListener("DOMContentLoaded", inicializarCanciones);

window.buscarCancionesPorSeccion = buscarCancionesPorSeccion;
window.buscarCancionPorId = buscarCancionPorId;
