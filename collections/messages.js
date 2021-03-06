Messages = new Meteor.Collection("messages")

Meteor.methods({
  newMessage: function(message) {
    var room = Rooms.findOne({_id: message.roomId})
    var user = Meteor.user()

    if (!message.body)
      throw new Meteor.Error(400, "Messages need a body")
    if (!room)
      throw new Meteor.Error(400, "Messages must be posted to a valid room")
    if (!user)
      throw new Meteor.Error(401, "You must be signed in to do that")

    message = _.extend(_.pick(message, "body"), {
      createdAt: new Date().getTime(),
      roomId: room._id,
      userId: user._id,
      author: user.profile.nickname
    })

    if (Meteor.isClient)
      message.simulated = true

    message._id = Messages.insert(message)

    // Let the room know there's been new activity
    Rooms.update(room._id, {$set: {lastActive: new Date().getTime()}})

    return message
  }
})
