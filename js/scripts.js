// Object represents a pair of dice, each Player will have its own Dice object
function Dice() {
  this.dieOne = 1;
  this.dieTwo = 1;
  this.diceValue = 0;
    // diceValue may equal 4 through 12 (potential sums of a roll without 1 on either dice)
    // diceValue may equal 0, indicating one of the dice had a value of 1 (player's turn ends scenario)
    // diceValue may equal "pig out", indicating both dice had a value of 1 (player's turn ends and player loses total score)
}
Dice.prototype.roll = function() {
  this.dieOne = Math.floor((Math.random() * 6) + 1);
  this.dieTwo = Math.floor((Math.random() * 6) + 1);
  this.dieOneImgAddress = "img/" + this.dieOne + ".png";
  this.dieTwoImgAddress = "img/" + this.dieTwo + ".png";
  if (this.dieOne === 1 && this.dieTwo === 1) {
    this.diceValue = "pig out";
  } else if (this.dieOne === 1 || this.dieTwo === 1) {
    this.diceValue = 0;
  } else {
    this.diceValue = this.dieOne + this.dieTwo;
  }
}
// Object Player represents a player in the game
function Player(name) {
  this.name = name;
  this.turnScore = 0;
  this.totalScore = 0;
  this.isTurn = false;
  this.dice = new Dice;
}
Player.prototype.reactToDiceValue = function() {
  if (this.dice.diceValue === "pig out") {
    this.turnScore = 0;
    this.totalScore = 0;
    this.isTurn = false;
  } else if (this.dice.diceValue === 0) {
    this.turnScore = 0;
    this.isTurn = false;
  } else {
    this.turnScore += this.dice.diceValue;
  }
}

Player.prototype.chooseToEndTurn = function() {
  this.totalScore += this.turnScore;
  this.turnScore = 0;
}

function Game() {
  this.playerArray = [];
  this.scoreToWin = 100;
  this.activePlayerIndex = 0;
}
Game.prototype.setScoreToWin = function(newScore) {
  this.scoreToWin = newScore;
}
Game.prototype.addPlayer = function(playerName) {
  this.playerArray.push(new Player(playerName));
  this.playerArray[this.playerArray.length-1].playerID = 'player' + this.playerArray.length;
}
Game.prototype.checkForWinner = function() {
  for(var i=0; i<this.playerArray.length; i++) {
    if(this.playerArray[i].totalScore>=this.scoreToWin) {
      return this.playerArray[i].name;
    }
  }
  return false;
}

Game.prototype.nextPlayer = function() {
  var oldPlayerIndex = this.activePlayerIndex;
  // loops to front of player array if last player in array just finished thier turn
  if (this.activePlayerIndex === this.playerArray.length-1) {
    this.activePlayerIndex = 0;
    this.playerArray[oldPlayerIndex].isTurn = false;
    this.playerArray[0].isTurn = true;
    return;
  }
  this.playerArray[oldPlayerIndex].isTurn = false;
  this.activePlayerIndex++;
  this.playerArray[this.activePlayerIndex].isTurn = true;
  return;
}

Game.prototype.roll = function() {
  var activePlayer = this.playerArray[this.activePlayerIndex];
  activePlayer.dice.roll();
  activePlayer.reactToDiceValue();

  // update display of scores
  var jQueryPointer = '#' + activePlayer.playerID;
  $(jQueryPointer + " p.roll-score").text("Current Roll: " + activePlayer.dice.diceValue);
  $(jQueryPointer + " p.turn-score").text("Score This Turn: " + activePlayer.turnScore);
  $(jQueryPointer + " .die-pic1").attr("src", activePlayer.dice.dieOneImgAddress);
  $(jQueryPointer + " .die-pic2").attr("src", activePlayer.dice.dieTwoImgAddress);

  if (activePlayer.dice.diceValue === "pig out" || activePlayer.dice.diceValue === 0) {
    this.nextPlayer();
    $(jQueryPointer + " p.total-score").text("Total Score: " + activePlayer.totalScore);
    this.toggleActiveButtons();
  }
}

Game.prototype.toggleActiveButtons = function() {
  var activePlayerIndex = this.activePlayerIndex;

  $('#' + this.playerArray[0].playerID + ' button').prop('disabled', true);
  $('#' + this.playerArray[1].playerID + ' button').prop('disabled', true);
  $('#' + this.playerArray[activePlayerIndex].playerID + ' button').prop('disabled', false);
  $('#' + this.playerArray[activePlayerIndex].playerID + ' button.roll').focus();
}
Game.prototype.endTurn = function() {
  var activePlayer = this.playerArray[this.activePlayerIndex];
  var jQueryPointer = '#' + activePlayer.playerID;

  activePlayer.chooseToEndTurn();
  $(jQueryPointer + " p.roll-score").text("Current Roll: ");
  $(jQueryPointer + " p.turn-score").text("Score This Turn: ");
  $(jQueryPointer + " p.total-score").text("Total Score: " + activePlayer.totalScore);
  if (this.checkForWinner()) {
    $('#game-result span').text(this.checkForWinner());
    nextField("#game-play", "#game-result");
  }

  this.nextPlayer();
  this.toggleActiveButtons();
}
Game.prototype.initializeGame = function() {
  this.addPlayer($('#player1name').val());
  this.addPlayer($('#player2name').val());
  this.setScoreToWin($('#score-to-win').val());

  $('#player1>h3').text('Player 1: ' + this.playerArray[0].name);
  $('#player2>h3').text('Player 2: ' + this.playerArray[1].name);

  this.playerArray[0].isTurn = true;
  // show and hide proper divs
  nextField("#start", "#game-play");
  this.toggleActiveButtons();
}

// ======================
//  User Interface Logic
// ======================

var resetGame = function() {
  // clear the form fields
  $('#player1name').val('');
  $('#player2name').val('');
  $('#score-to-win').val(100);

  // show and hide proper divs
  nextField("#game-play", "#start");
  $("#game-result").hide();
  $('#player1name').focus();
}
var nextField = function(divHide, divShow) {
  $(divHide).hide();
  $(divShow).show();
}

$(document).ready(function() {
  var currentGame = new Game();
  $('#player1name').focus();

  // event handler for game submit
  $('#game-initializer').submit(function(event) {
    event.preventDefault();
    $('p.total-score').text("Total Score: ");
    // initialize game content
    currentGame.initializeGame();
  });

  // event handler for the roll button
  $('button.roll').click(function() {
    currentGame.roll();
  });

  $('button.end-turn').click(function() {
      currentGame.endTurn();
    });
    // event handler for the reset button
    $('#reset-game').click(function() {
      $('p.total-score').text("Total Score: ");
      currentGame = new Game();
      resetGame();
    });

  });
