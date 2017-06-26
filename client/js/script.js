function gameObject(game_data) {
  this.playersNumber = game_data.playersNumber;
  this.players = game_data.players;
  this.units = game_data.units;
  this.field = game_data.field;
  this.current_user = game_data.current_user;
  this.socket = game_data.socket;
  this.group_name = game_data.group_name;

  this.selectUnit = function(pos) {
    this.selected_unit = this.units[this.current_user].find(function(unit) {
      return unit.pos.i === pos.i && unit.pos.j === pos.j;
    });
  };

  this.is_next_cell = function(pos) {
    return Math.abs(pos.i - this.selected_unit.pos.i) <= 1 && Math.abs(pos.j - this.selected_unit.pos.j) <= 1;
  };

  this.getCell = function(pos) {
    return this.field.cells[pos.i][pos.j];
  };

  this.have_anough_move_points = function(pos) {
    var movePrice = this.getMovePrice(this.selected_unit, this.getCell(pos));
    return this.selected_unit.move_points >= movePrice;
  };

  this.getMovePrice = function(unit, cell) {
    if (unit.bonus_list.indexOf('scout') != -1) {
      return 1;
    } else {
      return cell.efects.reduce(function(price, efect) {
        if (efect === 'move_-_1') {
          price += 1;
        }
        return price;
      }, 1);
    }
  };

  this.move = function(pos) {
    if (this.selected_unit) {
      if (this.is_next_cell(pos) && this.have_anough_move_points(pos)) {
        console.log('move to', pos);
        //game socket emit
        this.socket.emit('move_unit', {
          from: this.selected_unit.pos,
          to: pos,
          group_name: this.group_name,
          user: this.current_user
        });
      }
    }
  };

  this.moveUnit = function(args) {
    var unit = this.units[args.user].find(function(unit) {
      return unit.pos.i === args.from.i && unit.pos.j === args.from.j;
    });
    unit.pos.i = args.to.i;
    unit.pos.j = args.to.j;
    unit.move_points -= this.getMovePrice(unit, this.getCell(args.to));

    var CELL_SIZE = 134;
    var UNIT_SIZE = 100;

    $('.unit[data-i="' + args.from.i + '"][data-j="' + args.from.j + '"]').
    attr('data-i', args.to.i).
    attr('data-j', args.to.j).
    css('left', (args.to.j + 1) * (CELL_SIZE) + ((args.to.i % 2 !== 0) ? CELL_SIZE / 2 : 0) - CELL_SIZE / 2 - UNIT_SIZE / 2).
    css('top', (args.to.i + 1) * (CELL_SIZE) - CELL_SIZE / 2 - UNIT_SIZE / 2 - Math.floor(args.to.i / 2) * 29.5);

  };
}

var Client = new(function() {
  this.getGamePanelHTML = function() {
    var html = '<div id="game_panel"><button id="end_turn">End Turn</button></div>';
    return html;
  };
  this.getGameFieldHTML = function(game) {
    var i, j,
      field = game.field,
      CELL_SIZE = 134,
      ROW_WIDTH = CELL_SIZE * field.width + CELL_SIZE / 2,
      UNIT_SIZE = 100,
      innerHTML = '',
      units = game.units,
      players = game.players;

    function convertCellTypesToImgUrl(types) {
      var res = [];
      types.forEach(function(type) {
        res.push('url(../img/cells/' + type + '.png)');
      });
      return res.join(', ');
    }



    function getCellHTML(cell, i, j) {
      return '<div class="hexagon ' + cell.names.join(' ') +
        '" style="background-image:' + convertCellTypesToImgUrl(cell.names) +
        '" title="' + cell.names.join(', ') + '" data-i="' + i + '" data-j="' + j + '" >' +
        '<div class="hexTop"></div><div class="hexBottom"></div></div>';
    }

    function getUnitPos(unit) {
      var top = (unit.pos.i + 1) * (CELL_SIZE) - CELL_SIZE / 2 - UNIT_SIZE / 2 - Math.floor(unit.pos.i / 2) * 29.5,
        left = (unit.pos.j + 1) * (CELL_SIZE) + ((unit.pos.i % 2 !== 0) ? CELL_SIZE / 2 : 0) - CELL_SIZE / 2 - UNIT_SIZE / 2;
      return 'left:' + left + 'px; top:' + top + 'px';
    }

    function getUnitHTML(unit, player) {
      return '<div data-i="' + unit.pos.i + '" data-j="' + unit.pos.j + '" draggable="true" class="unit" title="' + player.name + '.' + unit.type + '" style="background-color:' + player.color +
        '; background-image:url(../img/units/' + unit.type + '.png); ' + getUnitPos(unit) + '"></div>';
    }

    innerHTML += '<div id="game_field">';

    for (i = 0; i < field.height; i++) {
      innerHTML += '<div class="row" style="width: ' + ROW_WIDTH + 'px;">';
      for (j = 0; j < field.width; j++) {
        innerHTML += getCellHTML(field.cells[i][j], i, j);
      }
      innerHTML += '</div>';
    }

    for (i = 0; i < players.length; i++) {
      for (j = 0; j < units[players[i].name].length; j++) {
        innerHTML += getUnitHTML(units[players[i].name][j], players[i]);
      }
    }

    innerHTML += '</div>';

    return innerHTML;
  };

  this.printInBody = function printInBody(str) {
    document.body.innerHTML = str;
  };

  this.printLoginForm = function(socket) {
    socket.emit('add_user', {
      name: prompt('Your name?')
    });
  };

  this.printCreateGameForm = function(socket) {
    socket.emit('add_group', {
      name: prompt('group name?'),
      size: parseInt(prompt('group size?'))
    });
  };

  this.generateSelectOptions = function(optionsList) {
    return optionsList.reduce(function(prev, current) {
      return '<option value="' + current.value + '">' + current.name + '</option>';
    }, '');
  };

  this.printJoinGameForm = function(socket) {
    var self = this;
    var template =
      '<button id="refresh_join_list">Refresh</button>' +
      '<div><select id="join_list"></select></div>' +
      '<button id="join_game">Join</button>';
    this.printInBody(template);

    document.querySelector('#refresh_join_list').onclick = function() {
      console.log('refresh list');
      socket.emit('give_me_groups');
    };

    socket.on('not_full_groups_list', function(groups_list) {
      var select = document.querySelector('#join_list');
      select.innerHTML = self.generateSelectOptions(groups_list);
    });

    document.querySelector('#join_game').onclick = function() {
      var select = document.querySelector('#join_list');
      socket.emit('join_group', {
        name: select.options[select.selectedIndex].value,
      });
    };
  };

  this.printSelectOrJoinGame = function(socket) {
    var answer = prompt('Create or join game? (y/n)');
    if (answer === 'y') {
      this.printCreateGameForm(socket);
    } else {
      this.printJoinGameForm(socket);
    }
  };

  this.onload = function() {
    var socket = io();
    var self = this;

    /*socket.emit('add_user', {
      name: 'max'
    });

    socket.emit('add_group', {
      name: 'g',
      size: 2
    });*/
    this.printLoginForm(socket);
    this.printSelectOrJoinGame(socket);

    socket.on('start_game', function(game) {
      game.socket = this;
      GAME = new gameObject(game);

      self.printInBody(self.getGameFieldHTML(game) + self.getGamePanelHTML(GAME));

      var moveTo = null;
      var gf = document.querySelector('#game_field');
      var end_turn_btn = document.querySelector('#end_turn');
      var turn_is_end = false;

      end_turn_btn.addEventListener('click', function() {
        if (!turn_is_end) {
          GAME.socket.emit('end_turn', {
            group_name: GAME.group_name,
            user_name: GAME.current_user
          });
          turn_is_end = true;
          end_turn_btn.innerText = 'wait for players';
        }
      });

      function getPosFromHTML(el) {
        return {
          i: parseInt(el.dataset.i),
          j: parseInt(el.dataset.j)
        };
      }
      gf.addEventListener('dragstart', function(e) {
        GAME.selectUnit(getPosFromHTML(e.target));
        console.log('dragstart', GAME.selected_unit)
      });
      gf.addEventListener('dragover', function(e) {
        if (e.target.classList.contains('hexagon') && moveTo != e.target) {
          moveTo = e.target;
        }
      });
      gf.addEventListener('dragend', function(e) {
        GAME.move(getPosFromHTML(moveTo));
      });
    });

    socket.on('move_unit', function(args) {
      GAME.moveUnit(args);
    });
  };

})();

window.onload = Client.onload.bind(Client);
