var pathToken = location.pathname.split('/')
var id = +pathToken[pathToken.length - 1]

App.note = App.cable.subscriptions.create({channel: "NoteChannel", id: id}, {
  on: function(name, fn) {
    return this;
  },

  emit: function(name, data1, data2, data3) {
    console.log('emit', name, data1, data2, data3)

    if(name == 'operation') {
      this.perform('operation', {clientId: this.clientId, revision: data1, operation: data2, selection: data3})
    }
    else if(name == 'selection') {
      this.perform('selection', {clientId: this.clientId, selection: data1})
    }
  },

  connected: function() {
    this.clientId = Math.random().toString() // ユーザIDは適当に決定

    var cm = CodeMirror.fromTextArea(document.getElementById('note'), {
      lineNumbers: true,
      lineWrapping: true,
    });

    this.adapter = new ot.SocketIOAdapter(this) // thisに互換メソッドを実装（on, emit）
    var cmAdapter = new ot.CodeMirrorAdapter(cm)
    var client = new ot.EditorClient(1, [this.clientId], this.adapter, cmAdapter)
  },

  disconnected: function() {
    // Called when the subscription has been terminated by the server
  },

  received: function(data) {
    console.log('received', data)

    if(data.action == 'operation' && data.clientId != this.clientId) {
      this.adapter.callbacks.operation.apply(this.adapter, [data.operation])
      this.adapter.callbacks.selection.apply(this.adapter, [data.clientId, data.selection])
    }
    else if(data.action == 'selection') {
      this.adapter.callbacks.selection.apply(this.adapter, [data.clientId, data.selection])
    }
    else if(data.action == 'ack' && data.clientId == this.clientId) {
      this.adapter.callbacks.ack.apply(this.adapter, [data.revision])
    }
  }
});
