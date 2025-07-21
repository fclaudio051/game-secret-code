const Players = {
  list: [],

 
  addPlayer(name, color, code) {
    
    this.list.push({
      name,
      color,
      code,
      progress: Array(4).fill(null), 
      active: true, 
      score: 0, 
      errors: 0, 
      attempts: [[], [], [], []] 
    });
    
    UI.refreshPlayersList();
  },

  
  updatePlayer(index, name, color, code) {
    if (index >= 0 && index < this.list.length) {
      this.list[index].name = name;
      this.list[index].color = color;
      this.list[index].code = code;
      
      UI.refreshPlayersList();
    } else {
      console.error("Índice de jogador inválido para atualização.");
    }
  },

  
  deletePlayer(index) {
    if (index >= 0 && index < this.list.length) {
      this.list.splice(index, 1);
      
      UI.refreshPlayersList();
    } else {
      console.error("Índice de jogador inválido para exclusão.");
    }
  }
};