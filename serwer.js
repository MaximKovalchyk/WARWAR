function Serwer(port) {
  var express = require('express');
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var PageFactoryMethod = new(require('./pages/PageFactoryMethod'))();
  var pagesPath = [
    'login',
    'createGame',
    'game',
    'menu',
    'joinGame'
  ];
  pagesPath.forEach(function(path) {
    var page = PageFactoryMethod.getPage(path);
    app.get('/' + path, function(req, res) {
      res.send(page.printPage());
    });
  });

  //add static resourses
  app.use(express.static('public'));

  http.listen(port, function() {
    console.log('listening on *:' + port);
  });
}

new Serwer(3000);
