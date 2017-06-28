(function Serwer() {
  console.log('main src');
  var express = require('express');
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var userGroupsList = new(require('./serwer/UsersSocketGroupList'))();
  var Game = require('./game/game');
  var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
  var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;

  app.use(express.static('client'));

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
  });

  http.listen(port, ipaddress, function() {
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
        game.group_name = group.name;
        userGroupsList.forEachInGroup(group.name, function(s) {
          game.current_user = userGroupsList.users[s.id].name;
          s.emit('start_game', game);
        });
      }
    });

    socket.on('move_unit', function(args) {
      userGroupsList.forEachInGroup(args.group_name, function(s) {
        s.emit('move_unit', args);
      });
    });

    socket.on('end_turn', function(args) {
      userGroupsList.groups[args.group_name].turn_end = userGroupsList.groups[args.group_name].turn_end || {};
      userGroupsList.groups[args.group_name].turn_end[args.user_name] = true;

      if (Object.keys(userGroupsList.groups[args.group_name].turn_end).length === userGroupsList.getMaxGroupLen(args.group_name)) {
        userGroupsList.forEachInGroup(args.group_name, function(s) {
          s.emit('next_turn');
          delete userGroupsList.groups[args.group_name].turn_end;
        });
      }

    });



  });

})();
