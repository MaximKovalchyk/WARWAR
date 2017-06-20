function UserSocketGroupList() {
  this.groups = Object.create(null);
  this.users = Object.create(null);
}

UserSocketGroupList.prototype.getNotFullGroups = function() {
  var res = [];
  for (var groupName in this.groups) {
    if (!this.groupIsFull(groupName)) {
      res.push(groupName);
    }
  }
  return res;
};

UserSocketGroupList.prototype.getGroupMembers = function(groupName) {
  return this.groups[groupName].members;
};

UserSocketGroupList.prototype.getGroupLen = function(groupName) {
  return this.getGroupMembers(groupName).length;
};

UserSocketGroupList.prototype.getMaxGroupLen = function(groupName) {
  return this.groups[groupName].size;
};

UserSocketGroupList.prototype.addUser = function(id, user) {
  this.users[id] = user;
};

UserSocketGroupList.prototype.addGroup = function(group) {
  group.members = [];
  this.groups[group.name] = group;
};

UserSocketGroupList.prototype.joinGroup = function(groupName, socket) {
  if (!(groupName in this.groups)) {
    return false;
  }

  if (this.getGroupLen(groupName) >= this.getMaxGroupLen(groupName)) {
    return false;
  }

  var group = this.groups[groupName];

  group.members.push(socket);
  socket.group = group;
  return true;
};

UserSocketGroupList.prototype.groupIsFull = function(groupName) {
  return this.getGroupLen(groupName) === this.getMaxGroupLen(groupName);
};

UserSocketGroupList.prototype.forEachInGroup = function(groupName, fn) {
  this.getGroupMembers(groupName).forEach(fn);
};

module.exports = UserSocketGroupList;
