var pathToken = location.pathname.split('/')
var id = +pathToken[pathToken.length - 1]

App.note = App.cable.subscriptions.create({channel: "NoteChannel", id: id}, {
  connected: function() {
    // Called when the subscription is ready for use on the server
  },

  disconnected: function() {
    // Called when the subscription has been terminated by the server
  },

  received: function(data) {
    // Called when there's incoming data on the websocket for this channel
  },

  operation: function(operation) {
    return this.perform('operation', {operation: operation});
  }
});
