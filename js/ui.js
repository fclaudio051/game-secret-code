const UI = {
  
  showAddPlayer(editIndex = null) {
    const form = document.getElementById('player-form');
    form.classList.remove('hidden'); 

    const player = editIndex !== null ? Players.list[editIndex] : null;

    
    form.innerHTML = '';

    const playerCardDiv = document.createElement('div');
    playerCardDiv.classList.add('player-card');

    const h3 = document.createElement('h3');
    h3.textContent = `${editIndex === null ? 'Adicionar' : 'Editar'} Jogador`;
    playerCardDiv.appendChild(h3);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'playerName';
    nameInput.placeholder = 'Nome';
    nameInput.maxLength = 10;
    nameInput.value = player ? player.name : '';
    playerCardDiv.appendChild(nameInput);
    playerCardDiv.appendChild(document.createElement('br'));

    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Cor: ';
    playerCardDiv.appendChild(colorLabel);

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'playerColor';
    
    colorInput.value = player ? player.color : '#' + Math.floor(Math.random() * 16777215).toString(16);
    playerCardDiv.appendChild(colorInput);
    playerCardDiv.appendChild(document.createElement('br'));

    const codeP = document.createElement('p');
    codeP.textContent = 'Código (4 números 0-9):';
    playerCardDiv.appendChild(codeP);

    
    for (let i = 0; i < 4; i++) {
      const codeInput = document.createElement('input');
      codeInput.type = 'password';
      codeInput.min = '0';
      codeInput.max = '9';
      codeInput.maxLength = 1;
      codeInput.id = `d${i}`;
      codeInput.placeholder = '*';
      
      if (player && player.code && player.code[i] !== undefined) {
        codeInput.value = player.code[i];
      }
      playerCardDiv.appendChild(codeInput);
    }
    playerCardDiv.appendChild(document.createElement('br'));

    const submitButton = document.createElement('button');
    submitButton.id = 'submitPlayerBtn';
    submitButton.textContent = editIndex === null ? 'Adicionar' : 'Atualizar';
    submitButton.classList.add('btn-primary'); 
    playerCardDiv.appendChild(submitButton);

    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancelFormBtn';
    cancelButton.textContent = 'Cancelar';
    cancelButton.classList.add('btn-secondary'); 
    playerCardDiv.appendChild(cancelButton);

    form.appendChild(playerCardDiv);

    
    submitButton.addEventListener('click', () => {
      if (editIndex === null) {
        this.addPlayer();
      } else {
        this.updatePlayer(editIndex);
      }
    });
    cancelButton.addEventListener('click', () => this.cancelForm());
  },

  
  cancelForm() {
    document.getElementById('player-form').classList.add('hidden');
    document.getElementById('player-form').innerHTML = ''; 
  },

  
  _getFormData() {
    const name = document.getElementById('playerName').value.trim();
    const color = document.getElementById('playerColor').value;
    let code = [];
    for (let i = 0; i < 4; i++) {
      const input = document.getElementById(`d${i}`);
      const val = parseInt(input.value);
      if (isNaN(val) || val < 0 || val > 9) {
        return { error: 'Código inválido! Digite 4 números entre 0 e 9.' };
      }
      code.push(val);
    }
    return { name, color, code };
  },

  
  addPlayer() {
    const data = this._getFormData();
    if (data.error) {
      document.getElementById('feedback').innerText = data.error; 
      return;
    }
    
    Players.addPlayer(data.name || `Jogador ${Players.list.length + 1}`, data.color, data.code);
    this.cancelForm();
    document.getElementById('feedback').innerText = ''; 
  },

  
  updatePlayer(index) {
    const data = this._getFormData();
    if (data.error) {
      document.getElementById('feedback').innerText = data.error; 
      return;
    }
    Players.updatePlayer(index, data.name || `Jogador ${index + 1}`, data.color, data.code);
    this.cancelForm();
    document.getElementById('feedback').innerText = ''; o
  },

  
  refreshPlayersList() {
    const list = document.getElementById('players-list');
    list.innerHTML = ''; 

    Players.list.forEach((p, i) => {
      const playerCardDiv = document.createElement('div');
      playerCardDiv.classList.add('player-card');
      playerCardDiv.style.borderLeft = `5px solid ${p.color}`;

      const strongName = document.createElement('strong');
      strongName.textContent = p.name;
      playerCardDiv.appendChild(strongName);

      const codeText = document.createTextNode(' - Código: **** ');
      playerCardDiv.appendChild(codeText);

      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.classList.add('btn-secondary'); 
      editButton.addEventListener('click', () => this.showAddPlayer(i));
      playerCardDiv.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.classList.add('btn-danger'); 
      deleteButton.addEventListener('click', () => Players.deletePlayer(i));
      playerCardDiv.appendChild(deleteButton);

      list.appendChild(playerCardDiv);
    });

    
    document.getElementById('startGameBtn').classList.toggle('hidden', Players.list.length < 2);
  },

  
  showCodes() {
    const codesDiv = document.getElementById('codesStatus');
    codesDiv.innerHTML = ''; 

    Players.list.forEach((p) => {
      if (p.active) {
        const codeCardDiv = document.createElement('div');
        codeCardDiv.classList.add('code-card');
        codeCardDiv.style.background = `${p.color}55`; 

        const h3 = document.createElement('h3');
        h3.textContent = p.name;
        codeCardDiv.appendChild(h3);

        const codeDisplayDiv = document.createElement('div');
        codeDisplayDiv.classList.add('code-display');
        codeDisplayDiv.textContent = p.progress.map(v => (v === null ? '_' : v)).join(' ');
        codeCardDiv.appendChild(codeDisplayDiv);

        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('score');
        scoreDiv.textContent = `Acertos: ${p.score} | Erros: ${p.errors}`;
        codeCardDiv.appendChild(scoreDiv);

        codesDiv.appendChild(codeCardDiv);
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

      const attemptsLineDiv = document.createElement('div');
      attemptsLineDiv.classList.add('attempts-line');

      const strongName = document.createElement('strong');
      strongName.textContent = `${p.name}: `;
      attemptsLineDiv.appendChild(strongName);

      p.attempts[pos].forEach(num => {
        const attemptSpan = document.createElement('span');
        attemptSpan.classList.add('attempt-number');
        if (num === p.code[pos]) {
          attemptSpan.classList.add('correct'); 
        } else if (num < p.code[pos]) {
          attemptSpan.classList.add('lower');
        } else {
          attemptSpan.classList.add('higher');
        }
        attemptSpan.textContent = num;
        attemptsLineDiv.appendChild(attemptSpan);
      });
      attemptsContent.appendChild(attemptsLineDiv);
    });
  }
};
