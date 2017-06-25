(function Serwer(port) {
  console.log('main src');
  var express = require('express');
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var userGroupsList = new(require('./serwer/UsersSocketGroupList'))();
  var Game = require('./game/game');

  app.use(express.static('client'));

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
  });

  http.listen(port, function() {
    console.log('listening on *:' + port);
  });

  io.on('connection', function(socket) {
    socket.on('add_user', function(user) {
      console.log('add_user');
      userGroupsList.addUser(socket.id, user);
    });

    socket.on('add_group', function(group) {
      console.log('add_group');
      userGroupsList.addGroup(group);
      userGroupsList.joinGroup(group.name, this);
    });

    socket.on('give_me_groups', function() {
      console.log('give_me_groups');
      var res = userGroupsList.getNotFullGroups();
      res = res.map(function(gName) {
        return {
          name: gName,
          value: gName
        };
      });
      socket.emit('not_full_groups_list', res);
    });


    socket.on('join_group', function(group) {
      var userIsAdded = userGroupsList.joinGroup(group.name, this);

      if (userIsAdded && userGroupsList.groupIsFull(group.name)) {
        var game = new Game(userGroupsList.getUsers(group.name));
        userGroupsList.forEachInGroup(group.name, function(s) {
          game.current_user = userGroupsList.users[s.id].name;
          s.emit('start_game', game);
        });
      }
    });
  });

})(3000);
