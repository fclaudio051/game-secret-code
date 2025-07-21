const Game = {
  currentPlayer: 0,
  targetExtra: [], 

 
  startGame() {
    document.getElementById('config-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    this.currentPlayer = 0; 
    this.updateGameScreen();
  },

 
  updateGameScreen() {
    const activePlayers = Players.list.filter(p => p.active);

    if (activePlayers.length === 1) {
      this.declareWinner(activePlayers[0].name);
      return;
    }


    while (!Players.list[this.currentPlayer] || !Players.list[this.currentPlayer].active) {
      this.currentPlayer = (this.currentPlayer + 1) % Players.list.length;
    }

    document.getElementById('turnInfo').innerText = `Turno de ${Players.list[this.currentPlayer].name}`;

    const advDiv = document.getElementById('adversaries');
    advDiv.innerHTML = ''; 

    const pInstruction = document.createElement('p');
    pInstruction.textContent = 'Dê um palpite (0-9) para cada adversário ativo:';
    advDiv.appendChild(pInstruction);


    Players.list.forEach((player, index) => {
      if (index !== this.currentPlayer && player.active) {
        const div = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = `${player.name}:`;
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `guess_${index}`;
        input.min = '0';
        input.max = '9';
        input.placeholder = '0-9';
        input.style.width = '60px';

        div.appendChild(strong);
        div.appendChild(input);
        advDiv.appendChild(div);
      }
    });

    UI.showCodes(); 
    UI.showSidebarAttempts(); 
    document.getElementById('sidebarAttempts').classList.remove('hidden'); 
    document.getElementById('feedback').innerText = ''; 
  },

  makeAllGuesses() {
    let hasGuess = false;
    let feedbackMessages = []; 

    
    Players.list.forEach((player, index) => {
      if (index !== this.currentPlayer && player.active) {
        const input = document.getElementById(`guess_${index}`);
        if (input && input.value !== '') hasGuess = true;
      }
    });

    if (!hasGuess) {
      document.getElementById('feedback').innerText = '⚠️ Você precisa digitar pelo menos um palpite antes de confirmar!';
      return;
    }

    this.targetExtra = []; 

    Players.list.forEach((player, index) => {
      if (index === this.currentPlayer || !player.active) return; 

      const input = document.getElementById(`guess_${index}`);
      const guess = parseInt(input.value);

      let msg = '';
      if (isNaN(guess) || guess < 0 || guess > 9) {
        msg = `${player.name}: Palpite inválido.`;
        Players.list[this.currentPlayer].errors++; 
      } else {
        msg = this._evaluateSingleGuess(player, index, guess);
      }
      feedbackMessages.push(msg); 

      if (input) input.value = ''; 
    });

    document.getElementById('feedback').innerText = feedbackMessages.filter(Boolean).join('\n'); 
    UI.showCodes();
    UI.showSidebarAttempts();


    document.getElementById('sidebarAttempts').classList.add('hidden');
    setTimeout(() => document.getElementById('sidebarAttempts').classList.remove('hidden'), 300);

  
    if (this.targetExtra.length > 0) {
      this.iniciarChancesExtras();
    } else {
      this.nextTurn();
    }
  },


  _evaluateSingleGuess(targetPlayer, targetIndex, guess) {
    let msg = '';
    let nextIndex = targetPlayer.progress.indexOf(null); 

    if (nextIndex === -1) {
      return `${targetPlayer.name}: Código já descoberto.`; 
    }

    targetPlayer.attempts[nextIndex].push(guess);

    if (guess === targetPlayer.code[nextIndex]) {
      targetPlayer.progress[nextIndex] = guess;
      Players.list[this.currentPlayer].score++; 
      targetPlayer.attempts[nextIndex] = []; 

      msg = `${targetPlayer.name}: Acertou o dígito ${nextIndex + 1}!`;

      if (!targetPlayer.progress.includes(null)) {
        targetPlayer.active = false;
        msg += `\n${targetPlayer.name} foi eliminado!`;
      } else {
        this.targetExtra.push(targetIndex);
      }
    } else {
      Players.list[this.currentPlayer].errors++; 
      msg = `${targetPlayer.name}: Errou o dígito ${nextIndex + 1}.`;
    }
    return msg;
  },

  iniciarChancesExtras() {
    this.targetExtra = this.targetExtra.filter(idx => Players.list[idx].active);
    if (this.targetExtra.length === 0) {
      this.nextTurn(); 
      return;
    }
    const proximoAlvoIndex = this.targetExtra.shift(); 
    this.jogarContraUm(proximoAlvoIndex);
  },

  jogarContraUm(targetIndex) {
    const advDiv = document.getElementById('adversaries');
    advDiv.innerHTML = ''; 

    const pInstruction = document.createElement('p');
    pInstruction.textContent = `Você ganhou outra chance contra ${Players.list[targetIndex].name}:`;
    advDiv.appendChild(pInstruction);

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'extraGuess';
    input.min = '0';
    input.max = '9';
    input.placeholder = '0-9';
    input.style.width = '60px';
    advDiv.appendChild(input);

    const tryButton = document.createElement('button');
    tryButton.textContent = 'Tentar';
    tryButton.addEventListener('click', () => this.extraGuess(targetIndex)); 
    advDiv.appendChild(tryButton);
  },

  extraGuess(targetIndex) {
    const input = document.getElementById('extraGuess');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 0 || guess > 9) {
      document.getElementById('feedback').innerText = 'Palpite inválido! Digite um número entre 0 e 9.';
      return;
    }

    const targetPlayer = Players.list[targetIndex];
    let msg = this._evaluateSingleGuess(targetPlayer, targetIndex, guess); 

    document.getElementById('feedback').innerText = msg;
    UI.showCodes();
    UI.showSidebarAttempts();

    if (this.targetExtra.length > 0) {
      this.iniciarChancesExtras();
    } else {
      this.nextTurn();
    }
  },

  nextTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % Players.list.length;
    this.updateGameScreen();
  },

 
  declareWinner(name) {
    document.getElementById('game-screen').classList.add('hidden');

    const endScreen = document.createElement('div');
    endScreen.id = 'end-screen';

    const victoryContainer = document.createElement('div');
    victoryContainer.classList.add('victory-container');

    const victoryTitle = document.createElement('h2');
    victoryTitle.classList.add('victory-title');
    victoryTitle.textContent = `🏆 ${name} venceu o jogo! 🏆`;
    victoryContainer.appendChild(victoryTitle);

    const victoryText = document.createElement('p');
    victoryText.classList.add('victory-text');
    victoryText.textContent = 'Parabéns! Você dominou todos os códigos.';
    victoryContainer.appendChild(victoryText);

    const newGameBtn = document.createElement('button');
    newGameBtn.id = 'newGameBtn';
    newGameBtn.classList.add('victory-btn');
    newGameBtn.textContent = 'Novo Jogo';

    newGameBtn.addEventListener('click', () => {
      document.body.removeChild(endScreen);
      Game.restartGame();
    });
    victoryContainer.appendChild(newGameBtn);

    endScreen.appendChild(victoryContainer);
    document.body.appendChild(endScreen);

    if (typeof startConfettiAnimation === 'function') {
        startConfettiAnimation();
    } else {
        console.warn("startConfettiAnimation function not found. Ensure confetti.js is loaded and working.");
    }

  },

  restartGame() {
    Players.list.forEach(p => {
      p.progress = Array(4).fill(null);
      p.active = true;
      p.score = 0;
      p.errors = 0;
      p.attempts = [[], [], [], []];
    });

    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('config-screen').classList.remove('hidden');

    UI.refreshPlayersList(); 

    if (typeof stopConfettiAnimation === 'function') {
        stopConfettiAnimation();
    } else {
        console.warn("stopConfettiAnimation function not found. Ensure confetti.js is loaded and working.");
    }
  }
};