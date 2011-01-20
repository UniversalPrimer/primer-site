Pushy.SSENew = Class.create(Pushy.Transport, {
  name: "sse_new",

  unload: function() {
    this.disconnect();
    this.on_unload();
  },
  
  data_handler: function(e) {
    if(e.data.length > 0) {
      this.received(e.data);
    }
  },

  ping_handler: function(e) {
    this.ping();
  },

  error_handler: function(e) {
    this.transport_disconnect(); // ensure disconnect
    this.disconnected();
  },

  transport_connect: function() {

    this.event_source = new EventSource(this.url);

    this.data_handler_bound = this.data_handler.bind(this);
    this.ping_handler_bound = this.ping_handler.bind(this);

    this.event_source.addEventListener('data', this.data_handler_bound, false);

    this.event_source.addEventListener('ping', this.ping_handler_bound, false);
    
    this.event_source.onerror = this.error_handler.bind(this);

    
  },

  transport_disconnect: function() {
    if(!this.event_source) {
      return false;
    }
    this.event_source.removeEventListener('ping', this.ping_handler_bound, false);
    this.event_source.removeEventListener('data', this.data_handler_bound, false);
    this.event_source.onerror = Prototype.emptyFunction;

    this.event_source.close();
    this.event_source = null;
  }


});
