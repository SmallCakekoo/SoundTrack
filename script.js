// Este archivo asegura que todas las funcionalidades se inicialicen correctamente

document.addEventListener("DOMContentLoaded", function () {
  // Inicialización de animaciones WOW
  if (typeof WOW !== "undefined") {
    new WOW().init();
  }

  console.log("Verificando si la API se ha cargado correctamente...");

  // Verificar que los botones NO involucrados con la API estén funcionando
  // Excluimos los botones de energía que ya tienen funcionalidad desde api.js
  document.querySelectorAll(".btn-mood:not(.energy-btn)").forEach((boton) => {
    if (!boton.onclick) {
      boton.onclick = function (e) {
        console.log(
          "Botón presionado:",
          this.parentElement.querySelector("h3").textContent
        );
      };
    }
  });

  // Funcionalidad para voltear la tarjeta al hacer clic
  const flipCard = document.querySelector(".flip-card");
  if (flipCard) {
    // Voltear cuando se hace clic en la tarjeta (excepto en el botón de escuchar)
    flipCard.addEventListener("click", function (e) {
      // Si se hizo clic en el botón de escuchar o sus hijos, no volteamos
      if (
        e.target.classList.contains("energy-btn") ||
        e.target.closest(".energy-btn")
      ) {
        // No hacer nada, dejamos que el botón maneje su propio evento
        return;
      }

      // Alternamos la clase flipped
      this.classList.toggle("flipped");

      // Reproducimos un sonido de volteo
      const flipSound = new Audio(
        "https://www.soundjay.com/switch/sounds/switch-19.mp3"
      );
      flipSound.volume = 0.3;
      flipSound
        .play()
        .catch((e) => console.log("No se pudo reproducir el sonido de volteo"));
    });

    // Añadimos evento para volver a voltear la tarjeta si se hace doble clic en el lado trasero
    const flipCardBack = flipCard.querySelector(".flip-card-back");
    if (flipCardBack) {
      flipCardBack.addEventListener("dblclick", function (e) {
        flipCard.classList.remove("flipped");
      });
    }

    console.log("Funcionalidad de tarjeta volteable habilitada");
  }

  console.log("Scripts inicializados correctamente");
});
