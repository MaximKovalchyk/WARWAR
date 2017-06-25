var unitProto = {
  type: null,
  move_points: 2,
  health_points: 40,
  attack_points: 5,
  def_points: 5,
  experience: 0,
  bonus_list: null
};

var rangeUnitProto = createUnit(unitProto, {
  range_points: 2,
});

function createUnit(proto, args) {
  var unit = Object.create(proto);
  for (var field in args) {
    if (args.hasOwnProperty(field)) {
      unit[field] = args[field];
    }
  }
  return unit;
}

function createGeneral() {
  return createUnit(unitProto, {
    type: 'general',
    move_points: 3,
    bonus_list: []
  });
}

function createAxeMan() {
  return createUnit(unitProto, {
    type: 'axe',
    attack_points: 8,
    def_points: 8,
    bonus_list: []
  });
}

function createSpearMan() {
  return createUnit(unitProto, {
    type: 'spear',
    health_points: 56,
    attack_points: 11,
    def_points: 9,
    bonus_list: ['vs_horse_+_50']
  });
}

function createHourseMan() {
  return createUnit(unitProto, {
    type: 'horse',
    health_points: 75,
    attack_points: 12,
    def_points: 9,
    bonus_list: ['open_+_25']
  });
}

function createScout() {
  return createUnit(rangeUnitProto, {
    type: 'scout',
    range_points: 1,
    bonus_list: ['range_unit', 'scout']
  });
}

function createArcher() {
  return createUnit(rangeUnitProto, {
    type: 'archer',
    attack_points: 7,
    bonus_list: ['range_unit']
  });
}


var UnitGenerator = {
  getUnits: function(players) {
    var units = {};
    players.forEach(function(player) {
      units[player.name] = [];
      units[player.name].push(createGeneral());
      units[player.name].push(createHourseMan());
      units[player.name].push(createHourseMan());
      units[player.name].push(createSpearMan());
      units[player.name].push(createSpearMan());
      units[player.name].push(createAxeMan());
      units[player.name].push(createAxeMan());
      units[player.name].push(createScout());
      units[player.name].push(createScout());
    });
    return units;
  }
};
module.exports = UnitGenerator;
