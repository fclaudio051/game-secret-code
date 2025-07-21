
document.addEventListener('DOMContentLoaded', () => {
  
  UI.refreshPlayersList();


  document.getElementById('addPlayerBtn').addEventListener('click', () => UI.showAddPlayer());
  document.getElementById('startGameBtn').addEventListener('click', () => Game.startGame());

 
  document.getElementById('confirmGuessesBtn').addEventListener('click', () => Game.makeAllGuesses());

  
});