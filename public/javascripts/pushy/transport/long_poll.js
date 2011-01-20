Pushy.LongPoll = Class.create(Pushy.Transport, {
  name: "long_poll",

  // TODO Find max time for long polling before we need to force reconnect
  
  ajax_request: null,

  before_unload: function() {
    this.disconnect();
  },

  unload: function() {
    this.on_unload();
  },

  transport_initialize: function(params) {
    this.long_poll = true;
  },

  transport_connect: function() {
    var self = this;
    
    this.ajax_request = new Ajax.Request(this.url, {
      method: 'get',
      
      onCreate: function(response) {
        // Safari does not trigger onComplete when an error occures while connecting
        if (Prototype.Browser.WebKit) {
          response.request.transport.onerror = self.disconnected.bind(self);
        }
      },

      /*
      onLoaded: function() {
        self.connected();
      },
      */
      onComplete: function(transport) {
        if (transport.status == 0) {
          self.disconnected();
        } else {
          var data = transport.responseText.strip();
          if (data.length > 0) {
            self.received(data);
          }
          self.transport_connect(); // reconnect with samme session_id
        }
      }
    });
  },

  transport_disconnect: function() {
    this.ajax_request.abort();
    this.ajax_request = null;
  }

});