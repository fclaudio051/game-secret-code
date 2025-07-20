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
    this.list[index] = { ...this.list[index], name, color, code };
    UI.refreshPlayersList();
  },

  deletePlayer(index) {
    this.list.splice(index, 1);
    UI.refreshPlayersList();
  }
};
