function GameView(mediator) {
  var CELL_SIZE = 134,
    UNIT_SIZE = 100;

  this.mediator = mediator;

  this.getGamePanelHTML = function() {
    var html = '<div id="game_panel"><button id="end_turn">End Turn</button></div>';
    return html;
  };

  this.getCellHTML = function(cell, i, j) {
    function convertCellTypesToImgUrl(types) {
      var res = [];
      types.forEach(function(type) {
        res.push('url(../img/cells/' + type + '.png)');
      });
      return res.join(', ');
    }

    return '<div class="hexagon ' + cell.names.join(' ') +
      '" style="background-image:' + convertCellTypesToImgUrl(cell.names) +
      '" title="' + cell.names.join(', ') + '" data-i="' + i + '" data-j="' + j + '" >' +
      '<div class="hexTop"></div><div class="hexBottom"></div></div>';
  };

  this.refreshUnitView = function refreshUnitView(unit) {
    $('.unit[data-i="' + unit.pos.i + '"][data-j="' + unit.pos.j + '"]').html(this.getUnitInnerHTML(unit));
  };

  this.getUnitInnerHTML = function(unit) {
    return '<div>HP: ' + Math.ceil(unit.health_points) + '/' + unit.base_health_points +
      ' </div><div>MP: ' + unit.move_points + '/' + unit.base_move_points + ' </div>';
  };

  this.getUnitHTML = function(unit) {
    function getUnitPos(unit) {
      var top = (unit.pos.i + 1) * (CELL_SIZE) - CELL_SIZE / 2 - UNIT_SIZE / 2 - Math.floor(unit.pos.i / 2) * 29.5,
        left = (unit.pos.j + 1) * (CELL_SIZE) + ((unit.pos.i % 2 !== 0) ? CELL_SIZE / 2 : 0) - CELL_SIZE / 2 - UNIT_SIZE / 2;
      return 'left:' + left + 'px; top:' + top + 'px';
    }

    return '<div data-i="' + unit.pos.i + '" data-j="' + unit.pos.j + '" draggable="true" class="unit" title="' + unit.owner + '.' + unit.type + '" style="background-color:' + unit.color +
      '; background-image:url(../img/units/' + unit.type + '.png); ' + getUnitPos(unit) + '">' +
      this.getUnitInnerHTML(unit) +
      '</div>';
  };

  this.getGameFieldHTML = function(game_data) {
    var i, j,
      field = game_data.field,
      innerHTML = '',
      ROW_WIDTH = CELL_SIZE * field.width + CELL_SIZE / 2,
      unitsIterator = game_data.getUnitsIterator();



    innerHTML += '<div id="game_field">';

    //print cells
    for (i = 0; i < field.height; i++) {
      innerHTML += '<div class="row" style="width: ' + ROW_WIDTH + 'px;">';
      for (j = 0; j < field.width; j++) {
        innerHTML += this.getCellHTML(field.cells[i][j], i, j);
      }
      innerHTML += '</div>';
    }

    //print units
    var unit;
    while (unitsIterator.is_next()) {
      unit = unitsIterator.next();
      innerHTML += this.getUnitHTML(unit);
    }

    innerHTML += '</div>';

    return innerHTML;
  };

  this.printInBody = function printInBody(str) {
    document.body.innerHTML = str;
  };

  this.printLoginForm = function() {
    this.mediator.enterUser({
      name: prompt('Your name?')
    });
  };

  this.printCreateGameForm = function() {
    this.mediator.createGame({
      name: prompt('group name?'),
      size: parseInt(prompt('group size?'))
    });
  };

  this.generateSelectOptions = function(optionsList) {
    return optionsList.reduce(function(prev, current) {
      return '<option value="' + current.value + '">' + current.name + '</option>';
    }, '');
  };

  this.printJoinGameForm = function() {
    var self = this;
    var template =
      '<button id="refresh_join_list">Refresh</button>' +
      '<div><select id="join_list"></select></div>' +
      '<button id="join_game">Join</button>';
    this.printInBody(template);

    document.querySelector('#refresh_join_list').onclick = function() {
      console.log('refresh list');
      self.mediator.emitSerwerEvent('give_me_groups');
    };
    this.mediator.addListenerToSerwerEvent('not_full_groups_list', function(groups_list) {
      var select = document.querySelector('#join_list');
      select.innerHTML = self.generateSelectOptions(groups_list);
    });

    document.querySelector('#join_game').onclick = function() {
      var select = document.querySelector('#join_list');
      self.mediator.emitSerwerEvent('join_group', {
        name: select.options[select.selectedIndex].value,
      });
    };
  };

  this.printSelectOrJoinGame = function() {
    var answer = prompt('Create or join game? (y/n)');
    if (answer === 'y') {
      this.printCreateGameForm();
    } else {
      this.printJoinGameForm();
    }
  };

  this.addGameFieldEvents = function() {
    var self = this;
    var moveFrom = null;
    var moveTo = null;
    var gf = document.querySelector('#game_field');

    function getPosFromHTML(el) {
      return {
        i: parseInt(el.dataset.i),
        j: parseInt(el.dataset.j)
      };
    }

    gf.addEventListener('dragstart', function(e) {
      moveFrom = e.target;
      self.mediator.selectUnit(getPosFromHTML(e.target));
    });
    gf.addEventListener('dragover', function(e) {
      if (e.target.classList.contains('hexagon') && moveTo != e.target) {
        moveTo = e.target;
      }
    });
    gf.addEventListener('dragend', function(e) {
      self.mediator.moveSelectedUnit({
        from: getPosFromHTML(moveFrom),
        to: getPosFromHTML(moveTo),
      });
    });
  };

  this.addGamePanelEvents = function() {
    var self = this;
    var end_turn_btn = document.querySelector('#end_turn');
    end_turn_btn.addEventListener('click', function() {
      self.mediator.end_turn_btn_click();
    });
  };

  this.changeEndBtnText = function(text) {
    $('#end_turn').text(text);
  };

  this.printGame = function(game_data) {
    this.printInBody(this.getGameFieldHTML(game_data) + this.getGamePanelHTML(game_data));

    this.addGameFieldEvents();
    this.addGamePanelEvents();
  };

  this.refreshUnit = function(pos, unit) {
    var html_node = $('.unit[data-i="' + pos.i + '"][data-j="' + pos.j + '"]');
    if (!unit) {
      html_node.remove();
      return;
    }
    html_node.
    attr('data-i', unit.pos.i).
    attr('data-j', unit.pos.j).
    css('left', (unit.pos.j + 1) * (CELL_SIZE) + ((unit.pos.i % 2 !== 0) ? CELL_SIZE / 2 : 0) - CELL_SIZE / 2 - UNIT_SIZE / 2).
    css('top', (unit.pos.i + 1) * (CELL_SIZE) - CELL_SIZE / 2 - UNIT_SIZE / 2 - Math.floor(unit.pos.i / 2) * 29.5).
    html(this.getUnitInnerHTML(unit));
  };
}
