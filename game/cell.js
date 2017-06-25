var CellGenerator = {
  TYPES: {
    'field': [],
    'sand': ['def_-_25'],
    'snow': ['def_-_25'],
    'hill': ['def_+_50', 'vision_barrier', 'move_-_1'],
    'forest': ['def_+_50', 'vision_barrier', 'move_-_1'],
    'swamp': ['def_-_25', 'move_-_1'],
  },
  COMBINATIONS_TYPES: [
    ['hill', 'sand'],
    ['hill', 'snow'],
    ['hill', 'field'],
    ['forest', 'snow'],
    ['forest', 'field'],
    ['hill', 'forest', 'field'],
    ['swamp', 'sand'],
    ['swamp', 'field'],
    ['sand'],
    ['field'],
    ['snow'],
  ],

  GetRandomCellType: function() {
    var len = this.COMBINATIONS_TYPES.length,
      i = Math.floor(Math.random() * len);
    return this.COMBINATIONS_TYPES[i];
  },

  CreateRandomCell: function() {
    return this.create(this.GetRandomCellType());
  },

  create: function(types) {
    var efects = [];
    for (var i = 0; i < types.length; i++) {
      efects = efects.concat(this.TYPES[types[i]]);
    }
    return new Cell(types, efects);
  },
};

function Cell(names, efects) {
  this.unit = null;
  this.names = names;
  this.efects = efects;
}

module.exports = CellGenerator;
