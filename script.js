document.addEventListener("DOMContentLoaded", function () {
  if (typeof WOW !== "undefined") {
    new WOW().init();
  }

  console.log("Verificando si la API se ha cargado correctamente...");

  document.querySelectorAll(".btn-mood:not(.energy-btn)").forEach((boton) => {
    if (!boton.onclick) {
      boton.onclick = function (e) {
        e.stopPropagation();
        console.log(
          "Botón presionado:",
          this.parentElement.querySelector("h3").textContent
        );
      };
    }
  });

  const flipCards = document.querySelectorAll(".flip-card");
  if (flipCards.length > 0) {
    flipCards.forEach(function (flipCard) {
      flipCard.addEventListener("click", function (e) {
        if (
          e.target.classList.contains("btn-mood") ||
          e.target.closest(".btn-mood")
        ) {
          return;
        }

        this.classList.toggle("flipped");

        if (this.classList.contains("flipped")) {
          this.style.zIndex = "10";
        } else {
          setTimeout(() => {
            this.style.zIndex = "1";
          }, 600);
        }
      });

      const flipCardBack = flipCard.querySelector(".flip-card-back");
      if (flipCardBack) {
        flipCardBack.addEventListener("dblclick", function (e) {
          flipCard.classList.remove("flipped");

          setTimeout(() => {
            flipCard.style.zIndex = "1";
          }, 600);
        });
      }
    });

    console.log(
      "Funcionalidad de tarjetas volteables habilitada para " +
        flipCards.length +
        " tarjetas"
    );
  }

  console.log("Scripts inicializados correctamente");
});

async function loadFavoriteArtists() {
  try {
    const response = await fetch("data/artistasfav.json");
    const artists = await response.json();

    const container = document.getElementById("favorite-artists-container");
    container.innerHTML = "";

    artists.forEach((artist) => {
      const artistCard = document.createElement("div");
      artistCard.className =
        "wow animate__animated animate__fadeInUp animate__faster";

      artistCard.innerHTML = `
        <div class="artist-card">
  <img src="${artist.foto}" alt="${artist.nombre}" class="artist-image">
 <div class="artist-info">
  <h3>${artist.nombre}</h3>
  <p>${artist.genero}</p>
  </div>
</div>
      `;

      container.appendChild(artistCard);
    });
  } catch (error) {
    console.error("Error al cargar los artistas favoritos:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadFavoriteArtists();
});

function stopCurrentPlayback() {
  const audioElements = document.querySelectorAll("audio");
  audioElements.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  // Restaurar los botones de play/pause normales
  const playButtons = document.querySelectorAll(".btn-play");
  const pauseButtons = document.querySelectorAll(".btn-pause");

  playButtons.forEach((button) => {
    button.style.display = "flex";
    button.classList.add(
      "animate__animated",
      "animate__pulse",
      "animate__infinite",
      "animate__slow"
    );
  });

  pauseButtons.forEach((button) => {
    button.style.display = "none";
  });

  // Restaurar los elementos de playlist
  const trackElements = document.querySelectorAll(".track");
  trackElements.forEach((track) => {
    track.classList.remove("playing");

    const playBtn = track.querySelector(".btn-play-track");
    const pauseBtn = track.querySelector(".btn-pause-track");
    const duration = track.querySelector(".track-duration");

    if (playBtn) playBtn.style.display = "none";
    if (pauseBtn) pauseBtn.style.display = "none";
    if (duration) duration.style.display = "inline-block";
  });

  const vinylDiscs = document.querySelectorAll(".vinyl-disc");
  vinylDiscs.forEach((disc) => {
    disc.classList.add("paused");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const randomizeButtons = document.querySelectorAll(".btn-randomize");

  randomizeButtons.forEach((button) => {
    const originalClickHandler = button.onclick;

    button.onclick = function (event) {
      stopCurrentPlayback();

      if (originalClickHandler) {
        originalClickHandler.call(this, event);
      }
    };
  });
});
