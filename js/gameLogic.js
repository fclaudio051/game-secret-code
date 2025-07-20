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
    if (Players.list.filter(p => p.active).length === 1) {
      this.declareWinner(Players.list.find(p => p.active).name);
      return;
    }
    while (!Players.list[this.currentPlayer].active) {
      this.currentPlayer = (this.currentPlayer + 1) % Players.list.length;
    }
    document.getElementById('turnInfo').innerText = `Turno de ${Players.list[this.currentPlayer].name}`;
    const advDiv = document.getElementById('adversaries');
    advDiv.innerHTML = '<p>Dê um palpite (0-9) para cada adversário ativo:</p>';
    for (let i = 0; i < Players.list.length; i++) {
      if (i !== this.currentPlayer && Players.list[i].active) {
        advDiv.innerHTML += `
          <div>
            <strong>${Players.list[i].name}:</strong>
            <input type="number" id="guess_${i}" min="0" max="9" placeholder="0-9" style="width:60px;">
          </div>
        `;
      }
    }
    UI.showCodes();
    UI.showSidebarAttempts();
    document.getElementById('sidebarAttempts').classList.remove('hidden');
    document.getElementById('feedback').innerText = '';
  },

  makeAllGuesses() {
    let filled = false;
    for (let i = 0; i < Players.list.length; i++) {
      if (i === this.currentPlayer || !Players.list[i].active) continue;
      const input = document.getElementById(`guess_${i}`);
      if (input && input.value !== '') {
        filled = true;
        break;
      }
    }
    if (!filled) {
      alert('⚠️ Você precisa digitar pelo menos um palpite antes de confirmar!');
      return;
    }

    let feedbackMsg = '';
    this.targetExtra = [];
    for (let i = 0; i < Players.list.length; i++) {
      if (i === this.currentPlayer || !Players.list[i].active) continue;
      const input = document.getElementById(`guess_${i}`);
      const guess = parseInt(input.value);
      if (isNaN(guess) || guess < 0 || guess > 9) {
        feedbackMsg += `\n${Players.list[i].name}: Palpite inválido.`;
        Players.list[this.currentPlayer].errors++;
        continue;
      }
      const targetPlayer = Players.list[i];
      let nextIndex = targetPlayer.progress.indexOf(null);
      if (nextIndex === -1) {
        feedbackMsg += `\n${targetPlayer.name}: Código já descoberto.`;
      } else {
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
            this.targetExtra.push(i);
          }
        } else {
          Players.list[this.currentPlayer].errors++;
          feedbackMsg += `\n${targetPlayer.name}: Errou o dígito ${nextIndex + 1}.`;
        }
      }
      input.value = '';
    }
    document.getElementById('feedback').innerText = feedbackMsg.trim();
    UI.showCodes();
    UI.showSidebarAttempts();

    document.getElementById('sidebarAttempts').classList.add('hidden');
    setTimeout(() => {
      document.getElementById('sidebarAttempts').classList.remove('hidden');
    }, 300);

    if (this.targetExtra.length > 0) {
      this.iniciarChancesExtras();
    } else {
      this.nextTurn();
    }
  },

  iniciarChancesExtras() {
    this.targetExtra = this.targetExtra.filter(idx => Players.list[idx].active);
    if (this.targetExtra.length === 0) { this.nextTurn(); return; }
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
    document.getElementById('mainArea').innerHTML = `<h2>🏆 ${name} venceu o jogo! 🏆</h2>`;
    document.getElementById('sidebarAttempts').classList.add('hidden');
  }
};
