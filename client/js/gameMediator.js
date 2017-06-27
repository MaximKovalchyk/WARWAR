function GameMediator() {
  this.socket = io();
  this.game_view = null;
  this.game_model = null;
  this.user = null;
  this.group_name = null;
  this.turn_is_end = false;

  this.runGame = function() {
    var self = this;

    this.game_view = new GameView(this);
    this.game_view.printLoginForm();
    this.game_view.printSelectOrJoinGame();

    this.addListenerToSerwerEvent('start_game', this.start_game_callback);
    this.addListenerToSerwerEvent('move_unit', this.move_unit_callback);
    this.addListenerToSerwerEvent('next_turn', this.next_turn_callback);
  };

  this.start_game_callback = function(game_data) {
    this.group_name = game_data.group_name;
    this.game_model = new GameModel(game_data, this);
    this.game_view.printGame({
      field: game_data.field,
      getUnitsIterator: this.game_model.getUnitsIterator.bind(this.game_model)
    });
  };

  this.next_turn_callback = function() {
    var unitsIterator = this.game_model.getUnitsIterator();
    var unit;

    this.turn_is_end = false;
    this.game_view.changeEndBtnText('Next turn');

    while (unitsIterator.is_next()) {
      unit = unitsIterator.next();
      this.game_model.end_unit_turn(unit);
      this.game_view.refreshUnit(unit.pos, unit);
    }
  };
  this.end_turn_btn_click = function() {
    if (!this.turn_is_end) {
      this.emitSerwerEvent('end_turn', {
        group_name: this.group_name,
        user_name: this.user.name
      });
      this.turn_is_end = true;
      this.game_view.changeEndBtnText('Wait for players');
    }

  };
  this.move_unit_callback = function(args) {
    this.game_model.moveUnit(args);
  };
  this.addListenerToSerwerEvent = function(event_name, callback) {
    this.socket.on(event_name, callback.bind(this));
  };
  this.emitSerwerEvent = function(name, args) {
    this.socket.emit(name, args);
  };
  this.enterUser = function(user) {
    this.user = user;
    this.emitSerwerEvent('add_user', user);
  };
  this.createGame = function(group) {
    this.emitSerwerEvent('add_group', group);
  };

  this.selectUnit = function(pos) {
    this.game_model.selectUnit(pos, this.user.name);
  };
  this.moveSelectedUnit = function(args) {
    // emit to serwer!!!
    args.group_name = this.group_name;
    args.user_name = this.user.name;
    this.emitSerwerEvent('move_unit', args);
  };
  this.refreshUnit = function(pos, unit) {
    this.game_view.refreshUnit(pos, unit);
  };
}
