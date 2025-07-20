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
    // Verificar se temos apenas um jogador ativo (vencedor)
    const activePlayers = Players.list.filter(p => p.active);
    if (activePlayers.length === 1) {
      this.declareWinner(activePlayers[0].name);
      return;
    }

    // Pular jogadores inativos
    while (!Players.list[this.currentPlayer].active) {
      this.currentPlayer = (this.currentPlayer + 1) % Players.list.length;
    }

    // Atualizar informações de turno
    document.getElementById('turnInfo').innerText = `Turno de ${Players.list[this.currentPlayer].name}`;
    
    // Gerar campos de palpites para adversários
    const advDiv = document.getElementById('adversaries');
    advDiv.innerHTML = '<p>Dê um palpite (0-9) para cada adversário ativo:</p>';
    Players.list.forEach((player, index) => {
      if (index !== this.currentPlayer && player.active) {
        advDiv.innerHTML += `
          <div>
            <strong>${player.name}:</strong>
            <input type="number" id="guess_${index}" min="0" max="9" placeholder="0-9" style="width:60px;">
          </div>
        `;
      }
    });

    UI.showCodes();
    UI.showSidebarAttempts();
    document.getElementById('sidebarAttempts').classList.remove('hidden');
    document.getElementById('feedback').innerText = '';
  },

  makeAllGuesses() {
    // Verificar se pelo menos um palpite foi dado
    let hasGuess = false;
    Players.list.forEach((player, index) => {
      if (index !== this.currentPlayer && player.active) {
        const input = document.getElementById(`guess_${index}`);
        if (input && input.value !== '') hasGuess = true;
      }
    });

    if (!hasGuess) {
      alert('⚠️ Você precisa digitar pelo menos um palpite antes de confirmar!');
      return;
    }

    let feedbackMsg = '';
    this.targetExtra = [];

    // Avaliar palpites
    Players.list.forEach((player, index) => {
      if (index === this.currentPlayer || !player.active) return;

      const input = document.getElementById(`guess_${index}`);
      const guess = parseInt(input.value);

      if (isNaN(guess) || guess < 0 || guess > 9) {
        feedbackMsg += `\n${player.name}: Palpite inválido.`;
        Players.list[this.currentPlayer].errors++;
      } else {
        this.evaluateGuess(player, index, guess, feedbackMsg);
      }

      if (input) input.value = '';
    });

    document.getElementById('feedback').innerText = feedbackMsg.trim();
    UI.showCodes();
    UI.showSidebarAttempts();

    // Efeito de animação na barra lateral
    document.getElementById('sidebarAttempts').classList.add('hidden');
    setTimeout(() => document.getElementById('sidebarAttempts').classList.remove('hidden'), 300);

    // Próxima jogada
    if (this.targetExtra.length > 0) {
      this.iniciarChancesExtras();
    } else {
      this.nextTurn();
    }
  },

  evaluateGuess(targetPlayer, index, guess, feedbackMsg) {
    let nextIndex = targetPlayer.progress.indexOf(null);

    if (nextIndex === -1) {
      feedbackMsg += `\n${targetPlayer.name}: Código já descoberto.`;
      return;
    }

    targetPlayer.attempts[nextIndex].push(guess);

    if (guess === targetPlayer.code[nextIndex]) {
      targetPlayer.progress[nextIndex] = guess;
      Players.list[this.currentPlayer].score++;
      targetPlayer.attempts[nextIndex] = [];
      feedbackMsg += `\n${targetPlayer.name}: Acertou o dígito ${nextIndex + 1}!`;

      if (!targetPlayer.progress.includes(null)) {
        targetPlayer.active = false;
        feedbackMsg += `\n${targetPlayer.name} foi eliminado!`;
      } else {
        this.targetExtra.push(index);
      }
    } else {
      Players.list[this.currentPlayer].errors++;
      feedbackMsg += `\n${targetPlayer.name}: Errou o dígito ${nextIndex + 1}.`;
    }
  },

  iniciarChancesExtras() {
    this.targetExtra = this.targetExtra.filter(idx => Players.list[idx].active);
    if (this.targetExtra.length === 0) {
      this.nextTurn();
      return;
    }
    const proximo = this.targetExtra.shift();
    this.jogarContraUm(proximo);
  },

  jogarContraUm(targetIndex) {
    const advDiv = document.getElementById('adversaries');
    advDiv.innerHTML = `
      <p>Você ganhou outra chance contra ${Players.list[targetIndex].name}:</p>
      <input type="number" id="extraGuess" min="0" max="9" placeholder="0-9" style="width:60px;">
      <button onclick="Game.extraGuess(${targetIndex})">Tentar</button>
    `;
  },

  extraGuess(targetIndex) {
    const input = document.getElementById('extraGuess');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 0 || guess > 9) {
      alert('Palpite inválido!');
      return;
    }

    const targetPlayer = Players.list[targetIndex];
    let nextIndex = targetPlayer.progress.indexOf(null);
    let msg = '';

    if (guess === targetPlayer.code[nextIndex]) {
      targetPlayer.progress[nextIndex] = guess;
      Players.list[this.currentPlayer].score++;
      targetPlayer.attempts[nextIndex] = [];
      msg += `Acertou o dígito ${nextIndex + 1} de ${targetPlayer.name}!`;

      if (!targetPlayer.progress.includes(null)) {
        targetPlayer.active = false;
        msg += `\n${targetPlayer.name} foi eliminado!`;
      } else {
        this.targetExtra.unshift(targetIndex);
      }
    } else {
      Players.list[this.currentPlayer].errors++;
      targetPlayer.attempts[nextIndex].push(guess);
      msg += `Errou o dígito ${nextIndex + 1} de ${targetPlayer.name}.`;
    }

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
  // Oculta área principal do jogo
  document.getElementById('game-screen').classList.add('hidden');

  // Mostra a tela de fim de jogo
  const endScreen = document.createElement('div');
  endScreen.id = 'end-screen';
  endScreen.innerHTML = `
    <h2>🏆 ${name} venceu o jogo! 🏆</h2>
    <button id="newGameBtn">Novo Jogo</button>
  `;
  document.body.appendChild(endScreen);

  document.getElementById('sidebarAttempts').classList.add('hidden');

  // Evento do botão "Novo Jogo"
  document.getElementById('newGameBtn').onclick = () => {
    document.body.removeChild(endScreen);
    Game.restartGame();
  };
},


  restartGame() {
  // Resetar dados dos jogadores
  Players.list.forEach(p => {
    p.progress = Array(4).fill(null);
    p.active = true;
    p.score = 0;
    p.errors = 0;
    p.attempts = [[], [], [], []];
  });

  // Mostrar tela de configuração para iniciar novo jogo
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('config-screen').classList.remove('hidden');

  // Atualizar lista de jogadores
  UI.refreshPlayersList();
},

};
