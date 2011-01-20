Pushy.SSE = Class.create(Pushy.Transport, {
  name: "sse",

  unload: function() {
    this.disconnect();
    this.on_unload();
  },
  
  data_handler: function(e) {
    this.ping_received();
    if(e.data.length > 0) {
      this.received(e.data);
    }
  },

  ping_handler: function(e) {
    this.ping_received();
    this.ping();
  },

  transport_connect: function() {

    this.event_source = document.createElement('event-source');
    this.event_source.setAttribute('src', this.url);

    // TODO hrm. random note: 
    //  Opera 9 does not seem to have onbeforeunload.
    // Opera < 9.5 must have the element added to the body
    // Opera >= 9.5 must _not_ have the element added to the body
    // TODO Opera 10.7+ should have support for native javascript API
    // TODO handle browser other than opera?
    if(opera.version() < 9.5) {
       document.body.appendChild(this.event_source);
    }
    
    this.data_handler_bound = this.data_handler.bind(this);
    this.ping_handler_bound = this.ping_handler.bind(this);

    this.event_source.addEventListener('data-event', this.data_handler_bound, false);

    this.event_source.addEventListener('ping', this.ping_handler_bound, false);

  },

  transport_disconnect: function() {
    if(!this.event_source) {
      return false;
    }
    this.event_source.removeEventListener('ping', this.ping_handler_bound, false);
    this.event_source.removeEventListener('data-event', this.data_handler_bound, false);
    this.event_source.setAttribute('src', '');

    if(opera.version() < 9.5) {
      $(this.event_source.remove());
    }
    this.event_source = null;
  }


});
