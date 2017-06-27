function GameModel(game_data, mediator) {
  this.players = game_data.players;
  this.units = game_data.units;
  this.field = game_data.field;
  this.mediator = mediator;

  this.selectUnit = function(pos, user_name) {
    this.selected_unit = this.findUnit(pos, user_name);
  };

  this.findUnit = function(pos, user_name) {
    return this.units[user_name].find(function(unit) {
      return unit.pos.i === pos.i && unit.pos.j === pos.j;
    });
  };

  this.globalFindUnit = function(pos) {
    var res, player;
    for (player in this.units) {
      res = this.findUnit(pos, player);
      if (res) {
        res.owner = player;
        break;
      }
    }
    return res;
  };
  return this.units[user_name].find(function(unit) {
    return unit.pos.i === pos.i && unit.pos.j === pos.j;
  });
};

this.is_next_cell = function(from, to) {
  return Math.abs(from.i - to.i) <= 1 && Math.abs(from.j - to.j) <= 1;
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

this.getAttackVal = function(unit, defUnit, pos) {
  var res = unit.attack_points;
  for (var i = 0; i < unit.bonus_list.length; i++) {
    switch (unit.bonus_list[i]) {
      case 'vs_horse_+_50':
        if (defUnit.bonus_list.indexOf('on_horse') > 0) {
          res *= 1.5;
        }
        break;
      case 'on_horse':
        if (pos.efects.indexOf('move_-_1') < 0) {
          res *= 1.25;
        }
        break;
    }
  }
  return res;
};

this.getDefVal = function(unit, defUnit, pos) {
  var res = defUnit.def_points;
  var no_terr_def_bonus = defUnit.bonus_list.indexOf('on_horse') > 0;

  for (var i = 0; i < defUnit.bonus_list.length; i++) {
    if (defUnit.bonus_list[i] === 'vs_horse_+_50' && unit.bonus_list.indexOf('on_horse') > 0) {
      res *= 1.5;
    }
  }

  if (!no_terr_def_bonus) {
    for (i = 0; i < pos.efects.length; i++) {
      switch (pos.efects[i]) {
        case 'def_-_25':
          res *= 0.75;
          break;
        case 'def_+_50':
          res *= 1.5;
          break;
      }
    }
  }
  return res;
};

this.delUnit = function(pos, user_name) {
  var index = this.units[user_name].indexOf(this.findUnit(pos, user_name));
  this.units[user_name].splice(index, 1);
  this.mediator.refreshUnit(pos);
};

this.moveUnit = function(args) {
  var unit = this.findUnit(args.from, args.user_name);
  var defUnit = this.globalFindUnit(args.to);
  var cell = this.getCell(args.to);
  var move_price = this.getMovePrice(unit, cell);

  if (this.is_next_cell(args.from, args.to)) {
    if (unit && move_price <= unit.move_points) {
      if (defUnit) {
        if (args.user_name === defUnit.owner) {
          return;
        }
        //attack
        var attackVal = this.getAttackVal(unit, defUnit, cell);
        var defVal = this.getDefVal(unit, defUnit, cell);
        var no_move = false;

        defUnit.health_points -= attackVal;
        unit.health_points -= defVal;

        if (defUnit.health_points <= 0) {
          this.delUnit(args.to, args.user_name);
        } else {
          no_move = true;
        }
        if (unit.health_points <= 0) {
          this.delUnit(args.from, args.user_name);
          no_move = true;
        }
        if (no_move) {
          unit.move_points -= move_price;
          this.mediator.refreshUnit(args.from, unit);
          this.mediator.refreshUnit(args.to, defUnit);
          return;
        }
      }
      //move
      unit.pos.i = args.to.i;
      unit.pos.j = args.to.j;
      unit.move_points -= move_price;
      this.mediator.refreshUnit(args.from, unit);
    }
  }

};

this.getUnitsIterator = function() {
  var units = [],
    index = 0,
    user, i, j;

  for (j = 0; j < this.players.length; j++) {
    for (i = 0; i < this.units[this.players[j].name].length; i++) {
      this.units[this.players[j].name][i].owner = this.players[j].name;
      this.units[this.players[j].name][i].color = this.players[j].color;
      units.push(this.units[this.players[j].name][i]);
    }
  }

  return {
    is_next: function() {
      return index < units.length;
    },
    next: function() {
      return units[index++];
    }
  };
};

this.end_unit_turn = function(unit) {
  function heal_for_move_points(unit) {
    if (unit.health_points < unit.base_health_points) {
      unit.health_points += 10 / unit.base_move_points * unit.move_points;
    }
    if (unit.health_points > unit.base_health_points) {
      unit.health_points = unit.base_health_points;
    }
  }

  function restore_move_points(unit) {
    unit.move_points = unit.base_move_points;
  }

  heal_for_move_points(unit);
  restore_move_points(unit);
};
}
