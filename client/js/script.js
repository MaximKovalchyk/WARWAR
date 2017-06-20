var Client = new(function() {
  this.printInBody = function printInBody(str) {
    document.body.innerHTML = str;
  };

  this.printLoginForm = function(socket) {
    socket.emit('add_user', {
      name: prompt('Your name?')
    });
  };

  this.printCreateGameForm = function(socket) {
    socket.emit('add_group', {
      name: prompt('group name?'),
      size: parseInt(prompt('group size?'))
    });
  };

  this.generateSelectOptions = function(optionsList) {
    return optionsList.reduce(function(prev, current) {
      return '<option value="' + current.value + '">' + current.name + '</option>';
    }, '');
  };

  this.printJoinGameForm = function(socket) {
    var self = this;
    var template =
      '<button id="refresh_join_list">Refresh</button>' +
      '<div><select id="join_list"></select></div>' +
      '<button id="join_game">Join</button>';
    this.printInBody(template);

    document.querySelector('#refresh_join_list').onclick = function() {
      console.log('refresh list');
      socket.emit('give_me_groups');
    };

    socket.on('not_full_groups_list', function(groups_list) {
      var select = document.querySelector('#join_list');
      select.innerHTML = self.generateSelectOptions(groups_list);
    });

    document.querySelector('#join_game').onclick = function() {
      var select = document.querySelector('#join_list');
      socket.emit('join_group', {
        name: select.options[select.selectedIndex].value,
      });
    };
  };

  this.printSelectOrJoinGame = function(socket) {
    var answer = prompt('Create or join game? (y/n)');
    if (answer === 'y') {
      this.printCreateGameForm(socket);
    } else {
      this.printJoinGameForm(socket);
    }
  };

  this.onload = function() {
    var socket = io();

    this.printLoginForm(socket);
    this.printSelectOrJoinGame(socket);
  };
})();

window.onload = Client.onload.bind(Client);
