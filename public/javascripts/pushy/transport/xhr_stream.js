Pushy.XhrStream = Class.create(Pushy.Transport, {
  name: "xhr_stream",
  
  ajax_request: null,

  before_unload: function() {
    this.disconnect();
  },

  unload: function() {
    this.on_unload();
  },

  transport_send: function(msg) {
    var len = 0;
    var self = this;

    this.ajax_request = new Ajax.Request(this.url, {
      method: 'get',
      parameters: {
        sending: true,
        msg: msg
      },
      onComplete: function(response) {
    
      }
    });
  },


  transport_connect: function() {
    var len = 0;
    var self = this;

    this.ajax_request = new Ajax.Request(this.url, {
      method: 'get',
      onCreate: function(response) {

          console.log("on_create");
        // XXX
        // TODO does not happen in newest chrome
        // so the following bugfix is likely version-specific
        // Safari does not trigger onComplete when an error occures while connecting
                /*
        if (Prototype.Browser.WebKit) {
          response.request.transport.onerror = self.disconnected.bind(self);
        }
                */
      },

      onInteractive: function(transport) {

          console.log('getting data');

        if(transport.status != 200) {
          return false;
        }

        var data = transport.responseText.slice(len);
        if(data == ' ') {
          self.ping();
        }
        data = data.strip();
        len = transport.responseText.length;
        if (data.length > 0) {
          self.received(data);
        }
      },

      onComplete: function() {
          console.log("on_complete");
        self.disconnected();
      }
    });
  },

  transport_disconnect: function() {
    if(this.ajax_request) {
      this.ajax_request.abort();
      this.ajax_request = null;
    }
  }

});

