// Configuración de canciones a buscar
const canciones = [
  {
    query: "ojalá milo j",
    seccion: "energy",
    posicion: 1,
  },
  {
    query: "magical doctor maretu",
    seccion: "energy",
    posicion: 2,
  },
  {
    query: "dai dai dai kirai dennoko",
    seccion: "energy",
    posicion: 3,
  },
  {
    query: "La locura está en mí Porta",
    seccion: "energy",
    posicion: 4,
  },
  {
    query: "el bipe crazypoint",
    seccion: "party",
    posicion: 1,
  },
];

// Opciones para la API de Spotify
const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": "eb40442d0emsh60c159590382679p18429cjsn3c066d2aa17c",
    "x-rapidapi-host": "spotify23.p.rapidapi.com",
  },
};

// URL de audio de respaldo en caso de que no funcione la API
const audioFallbackUrl =
  "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav";

// Variable global para el reproductor de audio
let audioActual = null;

// Función para buscar y mostrar una canción específica
async function buscarYMostrarCancion(cancionConfig) {
  try {
    const { query, seccion, posicion } = cancionConfig;
    console.log(`Buscando canción: ${query} para la sección ${seccion}`);

    // URL de búsqueda con la consulta codificada
    const searchUrl = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(
      query
    )}&type=multi&offset=0&limit=10&numberOfTopResults=5`;

    // Paso 1: Buscar la canción para obtener su ID
    const searchResponse = await fetch(searchUrl, options);
    const searchResult = await searchResponse.json();

    // Verificar si se encontraron resultados
    if (
      searchResult &&
      searchResult.tracks &&
      searchResult.tracks.items.length > 0
    ) {
      // Obtener el ID de la primera canción encontrada
      const cancion = searchResult.tracks.items[0].data;
      const trackId = cancion.id;
      console.log(`Canción encontrada: ${cancion.name}, ID: ${trackId}`);

      // Paso 2: Obtener información detallada de la canción usando el ID
      const trackUrl = `https://spotify23.p.rapidapi.com/tracks/?ids=${trackId}`;
      const trackResponse = await fetch(trackUrl, options);
      const trackResult = await trackResponse.json();

      // Verificar si se obtuvo información detallada
      if (trackResult && trackResult.tracks && trackResult.tracks.length > 0) {
        const trackInfo = trackResult.tracks[0];

        // Intentar obtener la URL de vista previa de la canción
        const previewUrl = trackInfo.preview_url;
        console.log(`URL de vista previa para ${cancion.name}:`, previewUrl);

        // Obtener la URL de la imagen de portada
        const portadaUrl = cancion.albumOfTrack.coverArt.sources[0].url;

        // Seleccionar los elementos del DOM correspondientes a la sección y posición
        const portadaElement = document.querySelector(
          `.${seccion}-image-${posicion}`
        );
        if (!portadaElement) {
          console.error(
            `No se encontró el elemento de portada para ${seccion}-image-${posicion}`
          );
          return;
        }

        // Actualizar la imagen de portada
        portadaElement.style.backgroundImage = `url('${portadaUrl}')`;

        // Obtener el elemento tarjeta padre
        const cardElement = portadaElement.closest(".flip-card");

        // Actualizar el título y artista en el frente de la tarjeta
        const contentElement = portadaElement.parentElement;
        const tituloElement = contentElement.querySelector("h3");
        const artistaElement = contentElement.querySelector("p");

        if (tituloElement) {
          tituloElement.textContent = cancion.name;
        }

        if (artistaElement) {
          artistaElement.textContent = cancion.artists.items
            .map((artist) => artist.profile.name)
            .join(", ");
        }

        // Actualizar la información en la parte trasera de la tarjeta si existe
        if (cardElement) {
          // Actualizar detalles en la parte trasera
          const songTitle = cardElement.querySelector(".song-title");
          const songArtist = cardElement.querySelector(".song-artist");
          const songAlbum = cardElement.querySelector(".song-album");
          const songRelease = cardElement.querySelector(".song-release");
          const songGenre = cardElement.querySelector(".song-genre");

          if (songTitle) songTitle.textContent = cancion.name;
          if (songArtist) {
            songArtist.textContent = cancion.artists.items
              .map((artist) => artist.profile.name)
              .join(", ");
          }
          if (songAlbum) songAlbum.textContent = cancion.albumOfTrack.name;
          if (songRelease && trackInfo.album) {
            songRelease.textContent = new Date(
              trackInfo.album.release_date
            ).getFullYear();
          }
          if (songGenre && trackInfo.album) {
            // Si no hay información de género disponible, usar uno genérico basado en la sección
            const generos = {
              energy: "Energético/Pop",
              happy: "Happy/Upbeat",
              sad: "Melancólico",
              relaxed: "Chill/Ambient",
              party: "Fiesta/Dance",
            };
            songGenre.textContent = generos[seccion] || "Pop/Contemporáneo";
          }
        }

        // Configurar el botón de reproducción
        const botonElement = contentElement.querySelector(`.${seccion}-btn`);
        if (!botonElement) {
          console.error(`No se encontró el botón para ${seccion}-btn`);
          return;
        }

        // Configurar el botón de reproducción con la URL de audio
        botonElement.disabled = false;
        botonElement.dataset.previewUrl = previewUrl || audioFallbackUrl;
        botonElement.dataset.cancionNombre = cancion.name;

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
              if (btn !== this) btn.textContent = "Escuchar";
            });
          }

          // Si ya hay un audio asignado a este botón
          if (audioActual && audioActual._botonActual === this) {
            // Si está reproduciendo, pausar
            if (!audioActual.paused) {
              audioActual.pause();
              this.textContent = "Escuchar";
              console.log(`Reproducción de ${nombreCancion} pausada`);
              return;
            }
            // Si está pausado, reanudar
            else {
              const playPromise = audioActual.play();
              this.textContent = "Pausar";
              console.log(`Reproducción de ${nombreCancion} reanudada`);

              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.error("Error al reproducir:", error);
                  this.textContent = "Escuchar";
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
            this.textContent = "Escuchar";
          };

          audioActual.onended = () => {
            this.textContent = "Escuchar";
            console.log(`Reproducción de ${nombreCancion} finalizada`);
          };

          audioActual.volume = 0.7;

          // Intentar reproducir
          const playPromise = audioActual.play();
          this.textContent = "Pausar";
          console.log(`Reproducción de ${nombreCancion} iniciada`);

          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error(`Error al reproducir ${nombreCancion}:`, error);
              this.textContent = "Escuchar";
            });
          }
        };

        console.log(
          `Canción ${cancion.name} configurada exitosamente en sección ${seccion}`
        );
      } else {
        console.error(
          `No se pudo obtener información detallada para la canción ${query}`
        );
      }
    } else {
      console.error(`No se encontraron resultados para la búsqueda: ${query}`);
    }
  } catch (error) {
    console.error(`Error al buscar la canción ${cancionConfig.query}:`, error);
  }
}

// Función principal que busca todas las canciones
async function buscarCanciones() {
  try {
    // Buscar cada canción en secuencia para no sobrecargar la API
    for (const cancion of canciones) {
      await buscarYMostrarCancion(cancion);
      // Pequeña pausa entre consultas para no sobrecargar la API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error al buscar canciones:", error);
  }
}

// Ejecutar la búsqueda cuando se carga la página
document.addEventListener("DOMContentLoaded", buscarCanciones);
