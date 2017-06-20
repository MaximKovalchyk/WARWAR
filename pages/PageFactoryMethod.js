PageFactoryMethod.prototype.getPage = function(path) {
  return {
    printPage: function() {
      return path + 'HW!';
    }
  };
};

function PageFactoryMethod() {

}

module.exports = PageFactoryMethod;
