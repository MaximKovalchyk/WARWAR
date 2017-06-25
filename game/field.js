var Cell = require('./cell');

module.exports = (function() {
  var field_proto = {

  };

  function allocField(width, height) {
    var i, j, arr, filedObj = Object.create(field_proto);

    arr = [];
    for (i = 0; i < height; i++) {
      arr[i] = [];
      for (j = 0; j < width; j++) {
        arr[i][j] = Cell.CreateRandomCell();
      }
    }

    filedObj.cells = arr;
    filedObj.width = width;
    filedObj.height = height;

    return filedObj;
  }

  function territorialGenerator(gameFiled) {

  }

  return {
    generate: function(width, height) {
      var area = allocField(width, height);
      territorialGenerator(area);
      return area;
    }
  };
})();
