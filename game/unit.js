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

function createUnit(args) {
  var unit = Object.create(null);
  for (var field in args) {
    unit[field] = args[field];
  }
  return unit;
}

function createGeneral() {
  return createUnit({
    type: 'general',
    move_points: 3,
    health_points: 40,
    attack_points: 5,
    def_points: 5,
    experience: 0,
    bonus_list: []
  });
}

function createAxeMan() {
  return createUnit({
    type: 'axe',
    move_points: 2,
    health_points: 40,
    attack_points: 8,
    def_points: 8,
    experience: 0,
    bonus_list: []
  });
}

function createSpearMan() {
  return createUnit({
    type: 'spear',
    move_points: 2,
    health_points: 56,
    attack_points: 11,
    def_points: 9,
    experience: 0,
    bonus_list: ['vs_horse_+_50']
  });
}

function createHourseMan() {
  return createUnit({
    type: 'horse',
    move_points: 4,
    health_points: 75,
    attack_points: 12,
    def_points: 9,
    experience: 0,
    bonus_list: ['open_+_25']
  });
}

function createScout() {
  return createUnit({
    type: 'scout',
    move_points: 2,
    health_points: 40,
    attack_points: 5,
    def_points: 5,
    experience: 0,
    bonus_list: ['range_unit', 'scout'],
    range_points: 1,
  });
}

function createArcher() {
  return createUnit(rangeUnitProto, {
    type: 'archer',
    move_points: 2,
    health_points: 40,
    attack_points: 9,
    def_points: 5,
    experience: 0,
    bonus_list: ['range_unit'],
    range_points: 2,
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
      units[player.name].push(createArcher());
      units[player.name].push(createArcher());
    });
    return units;
  }
};
module.exports = UnitGenerator;
