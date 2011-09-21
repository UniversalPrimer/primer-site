
Pushy.Transport = Class.create({
  // Safari needs to wait before connecting or else we get a spinner
  CONNECT_DELAY: 0.5, //sec
  RECONNECT_DELAY: 3, //sec
  PING_FREQUENCY: 5, // sec. how often are pings expected.

  long_poll: false, // are we using long-polling?
  auto_reconnect: true,
  connect_try_count: 0, // how many times has connect/reconnect been tried?
  max_connect_try_count: 3, // how many times should reconnect be tried? only taken into account if auto_reconnect it true

  // internal state variables
  reconnecting: false, 
  is_connected: false, 

  initialize: function(params) {

    if(params) {
      if(params.auto_reconnect === false) {
        this.auto_reconnect = false;
      }
    }

    if(Prototype.Browser.Opera) {
      // only fires when the user navigates away by clicking a link
      window.onunload = this.unload.bind(this);
    } else {
      // TODO test that this works with safari/chrome
      window.onbeforeunload = this.before_unload.bind(this);
      window.onunload = this.unload.bind(this);
    }
    
    this.transport_initialize(params);
  },

  before_unload: Prototype.emptyFunction,
  unload: Prototype.emptyFunction,

  transport_initialize: function(params) {},

  on_connect: Prototype.emptyFunction, // called on initial connection, not on reconnect. not guaranteed to work. (e.g. does not work for Opera 8.5 with long polling)
  on_connect_retry: function(try_count) {}, // when retrying to connect. called after failed connect attempt or after disconnect. only called if this.auto_reconnect is true.
  on_disconnect: function(final_try_count) {}, // when max reconnect count was reached without a connection, or in case of disabled auto-reconnect, when the first try fails. not called when this.disconnect() is called
  on_reconnect: Prototype.emptyFunction, // when successfully reconnected. does not trigger on reconnects due to max data for the connection being reached.
  on_receive: function(data) {}, // when data is received
  on_unload: Prototype.emptyFunction, // UNRELIABLE! (not always triggered for Opera). When page is unloaded, disconnect and garbage collection happens automatically; this is for additional logic. called after connection teardown.
  on_error: function(str) {}, // mostly triggered when invalid JSON is received
  on_ping: Prototype.emptyFunction, // UNRELIABLE (not triggered for long_poll transport, since that would require a disconnect/reconnect every 5 seconds) triggered even for transports that don't use ping-based disconnect detection (like SSE)

  error: function(str) {
      console.log("error: " + str);
    this.on_error(str);
  },

  // TODO improve welcome message
  is_welcome_message: function(msg) {
    if(!msg) {
      return false;
    }
    if(msg.type == 'welcome') {
      return true;
    }
    return false;
  },

  // called by transport when ping is received
  ping: function() {
    if(this.is_connected) {
      this.on_ping();
    }
  },

  validate_message: function(escaped_json_str) {
    var json_str = decodeURIComponent(escaped_json_str);
      console.log("validating: " + escaped_json_str);
    var msg = null;
    try {
      msg = json_str.evalJSON(true);
    } catch(e) {
      this.error('Invalid json received: ' + json_str);
      return false;
    }
    if(!msg.session_id) {
      this.error('Message with missing session id received');
      return false;
    }
    if(msg.session_id != this.session_id) {
      if(msg.session_id == this.old_session_id) {
        this.error('Received session_id from previous connection: "' + msg.session_id + '". This is likely due to a browser bug (seen in the wild on Opera 9.52 using Server-Sent Events).');
      } else {
        this.error('Message with invalid session id: "' + msg.session_id + '" received');
      }
      return false;
    }
    if(msg.session_msg_count < (this.session_msg_count + 1)) {
      this.error('Message with wrong message-count: "' + msg.session_msg_count + '" received');
      return false;
    }
    if(msg.session_msg_count > (this.session_msg_count + 1)) {
      this.error('Unimplemented: Got too high session_msg_count! Some missed messages: ' + msg.session_msg_count);
      return false;
    }

    this.session_msg_count++;
    
    return msg;
  },

  send: function(msg) {
    this.transport_send(msg);
  },

  received: function(msg_str) {
      console.log("received: " + msg_str)
    var msg = this.validate_message(msg_str);
    var got_welcome = this.is_welcome_message(msg);
    if(!this.is_connected && got_welcome) {
      if(!this.is_connected) { 
        this.connected();
      }
    } else if(this.is_connected && got_welcome) {
      // Opera 9.0+ using sse reconnects periodically
      // with no triggerable javascript
      // so we just have to deal with sometimes
      // receiveing un-asked-for welcome msgs
    } else if(!this.is_connected && !got_welcome) {
      this.transport_disconnect();
      this.disconnected();
      // TODO got non-welcome when disconnected
      // need to deal with this
    } else { // connected and didn't get welcome
      if(msg) {
        this.on_receive(msg.data);
      }
      // TODO should we deal with invalid data?
      // maybe an on_error handler is appropriate
    }
  },

  next_url: function() {
    var hostname = Pushy.nextHostname();
    return this.new_connect_url(hostname, true);
  },

  new_connect_url: function() { 
    this.session_id = Math.uuid(12);
    this.old_session_id = this.session_id;

    var params = Object.toQueryString({ transport: this.name,
                                        channel_id: this.channel_id,
                                        session_id: this.session_id });

    var hostname = this.base_hostname;


    // TODO options for https and other ports should be added
    var url = 'http://' + hostname + this.root_url + (this.root_url.include('?') ? '&' : '?') + params;

    //var url = this.root_url + (this.root_url.include('?') ? '&' : '?') + params;

    return url;
  },

  connect: function(base_hostname, root_url, channel_id, on_connect, on_receive, reconnecting) {

    this.disconnected_no_reconnect = false;
    this.is_connected = false;
    this.connect_try_count = 0;
    this.session_msg_count = -1; // next expected session_msg_count - 1

    this.base_hostname = base_hostname;
    this.root_url = root_url;
    this.channel_id = channel_id;
    
    this.url = this.new_connect_url();

    if(on_connect) {
        this.on_connect = on_connect;
    }

    if(on_receive) {
        this.on_receive = on_receive;
    }

      console.log("connecting");

    this.connect_try_count += 1;
    if(Prototype.Browser.WebKit) {
      this.transport_connect.bind(this).delay(this.CONNECT_DELAY);
    } else {
      this.transport_connect();
    }

  },
  
  name: null,

  connected: function() {
    this.connect_try_count = 0;
    this.is_connected = true;
    if(this.reconnecting) {
      this.reconnecting = false;
      this.on_reconnect();
    } else {
      this.on_connect();
    }
  },

  disconnected: function() {

    if(this.disconnected_no_reconnect) {
      return false;
    }
    this.is_connected = false;
    this.session_id = null; // prevent session id re-use
    if((this.max_connect_try_count < 0) || (this.auto_reconnect && (this.connect_try_count < this.max_connect_try_count))) {
      var do_reconnect = true;
      do_reconnect  = this.on_connect_retry(this.connect_try_count + 1);
      if(do_reconnect !== false) {
        this.reconnect();
      }
    } else {
      this.disconnected_no_reconnect = true;
      this.on_disconnect(this.connect_try_count);
    }
  },

  // if ping is used, this will have the id returned by setTimeout
  ping_timeout_id: null,

  ping_enabled: false, 

  // ping-based disconnects are disabled if ping_received is never called.
  ping_received: function(extra_wait_time) {
    this.ping_enabled = true;
    if(this.ping_timeout_id) {
      clearTimeout(this.ping_timeout_id);
      this.ping_timeout_id = null;
    }
    var wait_time = Math.round(((extra_wait_time || 0) + 2.5 * this.PING_FREQUENCY) * 1000);
    this.ping_timeout_id = setTimeout(this.ping_timeout.bind(this), wait_time);
  },

  ping_timeout: function() {   
    this.ping_timeout_id = null;
    this.disconnect(true); // ensure proper connection teardown
    this.disconnected();
  },

  reconnect: function() {
    this.session_msg_count = -1; // next expected session_msg_count - 1
    this.reconnecting = true;
    this.connect_try_count += 1;
    // fresh connection url needed as session_id re-use is not allowed
    this.url = this.new_connect_url(); 
    var extra_wait_time = 0 // seconds
    if(this.connect_try_count <= 1) {
      if(Prototype.Browser.WebKit) {
        extra_wait_time = this.RECONNECT_DELAY;
      } else {
        extra_wait_time = 0; // reconnect instantly
      }
    } else {
      // wait longer and longer to reconnect
      if(Prototype.Browser.WebKit) {
        extra_wait_time = this.connect_try_count + this.RECONNECT_DELAY;
      } else {
        extra_wait_time = this.connect_try_count;
      }
    }
    if(extra_wait_time == 0) {
      this.transport_connect();
    } else {
      this.transport_connect.bind(this).delay(extra_wait_time);
    }
    // only enable ping if it's been enabled for this transport
    if(this.ping_enabled) {
      // fake a ping to restart timeout
      this.ping_received(extra_wait_time);
    }

  },

  transport_disconnect: Prototype.emptyFunction,

  disconnect: function(auto_reconnect) {
    this.is_connected = false;
    this.session_id = null; // prevent session id re-use
    if(auto_reconnect) {
      this.auto_reconnect = true;
    } else {
      this.auto_reconnect = false;
    }
    // clear ping timeout if any
    if(this.ping_timeout_id) {
      clearTimeout(this.ping_timeout_id);
    }
    this.transport_disconnect();
  }

});

// TODO move to own file
// add abort() method to Prototype's Ajax.Request method
Ajax.Request.prototype.abort = function() {
    this.transport.onreadystatechange = Prototype.emptyFunction;
    this.transport.abort();
    // update active request count
    Ajax.activeRequestCount--;
};


//= require "transport/long_poll"
//= require "transport/xhr_stream"
//= require "transport/sse"
//= require "transport/sse_new"
//= require "transport/html_file"

