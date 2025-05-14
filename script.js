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
        e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
        console.log(
          "Botón presionado:",
          this.parentElement.querySelector("h3").textContent
        );
      };
    }
  });

  // Funcionalidad para voltear todas las tarjetas al hacer clic
  const flipCards = document.querySelectorAll(".flip-card");
  if (flipCards.length > 0) {
    flipCards.forEach(function (flipCard) {
      // Voltear cuando se hace clic en la tarjeta (excepto en el botón de escuchar)
      flipCard.addEventListener("click", function (e) {
        // Si se hizo clic en el botón de escuchar o sus hijos, no volteamos
        if (
          e.target.classList.contains("btn-mood") ||
          e.target.closest(".btn-mood")
        ) {
          // No hacer nada, dejamos que el botón maneje su propio evento
          return;
        }

        // Alternamos la clase flipped
        this.classList.toggle("flipped");

        // Si está volteada, asegurarnos de que sea visible por encima de otras tarjetas
        if (this.classList.contains("flipped")) {
          this.style.zIndex = "10";
        } else {
          // Después de un tiempo para la animación, restaurar el z-index
          setTimeout(() => {
            this.style.zIndex = "1";
          }, 600); // Este tiempo debe coincidir con la duración de la transición
        }
      });

      // Añadimos evento para volver a voltear la tarjeta si se hace doble clic en el lado trasero
      const flipCardBack = flipCard.querySelector(".flip-card-back");
      if (flipCardBack) {
        flipCardBack.addEventListener("dblclick", function (e) {
          flipCard.classList.remove("flipped");
          // Después de un tiempo para la animación, restaurar el z-index
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
