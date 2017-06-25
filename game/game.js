var Field = require('./field');
var Unit = require('./unit');

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createPlayer(name, color, bcolor) {
  return {
    name: name,
    color: color || getRandomColor(),
    bcolor: bcolor || getRandomColor()
  };
}

Game.prototype.setUnitInitPos = function() {
  if (this.playersNumber == 2) {
    //2 lines top & bottom
    var units = this.units[this.players[0].name],
      i = 0,
      I = 0,
      J = 0;
    for (i = 0; i < units.length; i++) {
      units[i].pos = {
        i: I,
        j: J++
      };
    }

    units = this.units[this.players[1].name];
    I = this.field.height - 1;
    J = this.field.width - 1;

    for (i = 0; i < units.length; i++) {
      units[i].pos = {
        i: I,
        j: J--
      };
    }
  }
};



function Game(players) {
  this.playersNumber = players.length;
  this.players = players.map(function(player) {
    return createPlayer(player.name);
  });
  this.units = Unit.getUnits(this.players);
  this.field = Field.generate(15, 10);
  this.setUnitInitPos();
}

module.exports = Game;
