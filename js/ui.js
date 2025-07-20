const UI = {
  showAddPlayer(editIndex = null) {
    const form = document.getElementById('player-form');
    form.classList.remove('hidden');
    const player = editIndex !== null ? Players.list[editIndex] : null;
    form.innerHTML = `
      <div class="player-card">
        <h3>${editIndex === null ? 'Adicionar' : 'Editar'} Jogador</h3>
        <input type="text" id="playerName" placeholder="Nome" maxlength="10"
          value="${player ? player.name : ''}"><br>
        <label>Cor: </label>
        <input type="color" id="playerColor" value="${player ? player.color : '#'+Math.floor(Math.random()*16777215).toString(16)}"><br>
        <p>Código (4 números 0-9):</p>
        ${[0,1,2,3].map(i => `<input type="password" min="0" max="9" maxlength="1" id="d${i}" placeholder="*">`).join('')}
        <br>
        <button onclick="${editIndex === null ? 'UI.addPlayer()' : `UI.updatePlayer(${editIndex})`}">${editIndex === null ? 'Adicionar' : 'Atualizar'}</button>
        <button onclick="UI.cancelForm()">Cancelar</button>
      </div>
    `;
  },

  cancelForm() {
    document.getElementById('player-form').classList.add('hidden');
    document.getElementById('player-form').innerHTML = '';
  },

  addPlayer() {
    const name = document.getElementById('playerName').value.trim() || `Jogador ${Players.list.length + 1}`;
    const color = document.getElementById('playerColor').value;
    let code = [];
    for (let i = 0; i < 4; i++) {
      const val = parseInt(document.getElementById(`d${i}`).value);
      if (isNaN(val) || val < 0 || val > 9) { alert('Código inválido!'); return; }
      code.push(val);
    }
    Players.addPlayer(name, color, code);
    this.cancelForm();
  },

  updatePlayer(index) {
    const name = document.getElementById('playerName').value.trim() || `Jogador ${index + 1}`;
    const color = document.getElementById('playerColor').value;
    let code = [];
    for (let i = 0; i < 4; i++) {
      const val = parseInt(document.getElementById(`d${i}`).value);
      if (isNaN(val) || val < 0 || val > 9) { alert('Código inválido!'); return; }
      code.push(val);
    }
    Players.updatePlayer(index, name, color, code);
    this.cancelForm();
  },

  refreshPlayersList() {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    Players.list.forEach((p, i) => {
      list.innerHTML += `
        <div class="player-card" style="border-left:5px solid ${p.color}">
          <strong>${p.name}</strong> - Código: ****
          <button onclick="UI.showAddPlayer(${i})">Editar</button>
          <button onclick="Players.deletePlayer(${i})">Excluir</button>
        </div>
      `;
    });
    document.getElementById('startGameBtn').classList.toggle('hidden', Players.list.length < 2);
  },

  showCodes() {
    const codesDiv = document.getElementById('codesStatus');
    codesDiv.innerHTML = '';
    Players.list.forEach((p) => {
      if (p.active) {
        let prog = p.progress.map(v => (v === null ? '_' : v)).join(' ');
        codesDiv.innerHTML += `
          <div class="code-card" style="background:${p.color}55">
            <h3>${p.name}</h3>
            <div class="code-display">${prog}</div>
            <div class="score">Acertos: ${p.score} | Erros: ${p.errors}</div>
          </div>
        `;
      }
    });
  },

  showSidebarAttempts() {
    const attemptsContent = document.getElementById('attemptsContent');
    attemptsContent.innerHTML = '';
    Players.list.forEach((p) => {
      if (!p.active) return;
      let pos = p.progress.indexOf(null);
      if (pos === -1) return;
      let line = `<div class="attempts-line"><strong>${p.name}:</strong> `;
      p.attempts[pos].forEach(num => {
        let className = '';
        if (num === p.code[pos]) className = 'correct';
        else if (num < p.code[pos]) className = 'lower';
        else className = 'higher';
        line += `<span class="attempt-number ${className}">${num}</span>`;
      });
      line += '</div>';
      attemptsContent.innerHTML += line;
    });
  }
};
