class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
        this.isFlipped = true;
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
        this.isFlipped = false;
    }

    toggleFlip(){
        if (this.isFlipped) {
            this.#unflip();
        } else {
            this.#flip();
        }
    }
    
    matches (otherCard) {
        return this.name === otherCard.name;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }

    shuffleCards() {
        this.cards.sort(() => Math.random() - 0.5);
    }

    flipDownAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip()
            }   
        }
        );
    }

    reset() {
        this.shuffleCards();
        this.flipDownAllCards();
        this.render();
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.intentos = 0;
        this.intervalId = null;
        this.elapsedTime = 0;
        this.isCronometroRunning = false;
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            if (!this.isCronometroRunning) {
                this.toggleCronometro(true);
                this.isCronometroRunning = true;
            }
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        const [card1, card2] = this.flippedCards;
        this.intentos += 1;
        if (card1.matches(card2)) {
            this.matchedCards.push(...this.flippedCards); 
            this.flippedCards = [];
            this.addMensajeIntentos(`Intento ${this.intentos}: ¡Pareja encontrada!`);
            if (this.matchedCards.length === this.board.cards.length) {
                this.toggleCronometro(false);
                this.addMensajeIntentos(`Juego completado en ${this.intentos} intentos y ${this.elapsedTime} segundos.`);
            }
        } else {
            setTimeout(() => {
                this.flippedCards.forEach(card => card.toggleFlip());
                this.flippedCards = [];
                this.addMensajeIntentos(`Intento ${this.intentos}: Pareja no coincidente.`);
            }, this.flipDuration);
        }
    }

    addMensajeIntentos(mensaje) {
        const mensajesElement = document.getElementById("mensajes-intentos");
        mensajesElement.innerHTML = '';
        const nuevoMensaje = document.createElement("div");
        nuevoMensaje.textContent = mensaje;
        mensajesElement.appendChild(nuevoMensaje);
    }

    resetGame() {
        this.flippedCards = [];
        this.matchedCards = [];
        this.board.reset();
        this.intentos = 0;
        this.toggleCronometro(false, true);
        this.addMensajeIntentos(323``);
        
    }

    toggleCronometro(start, reset = false) {
        const cronometroElement = document.getElementById("cronometro");

        if (reset) {
            clearInterval(this.intervalId);
            this.elapsedTime = 0;
            this.isCronometroRunning = false;
            cronometroElement.textContent = '00:00';
            return;
        }

        if (start) {
            this.intervalId = setInterval(() => {
                this.elapsedTime++;
                const minutes = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
                const seconds = (this.elapsedTime % 60).toString().padStart(2, '0');
                cronometroElement.textContent = `${minutes}:${seconds}`;
            }, 1000);
        } else {
            clearInterval(this.intervalId);
        }
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });

});
