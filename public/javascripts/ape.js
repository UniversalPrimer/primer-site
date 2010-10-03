
var ape = {

  // this is not to be called directly, but to be instantiated
  Channel: function(name, onReceive, onReady) {	
    this.name = name;
    this.pipe = null;
    this.onReceive = onReceive;
    this.onReady = onReady;

    this.send = function(msg) {
      this.pipe.send(msg);
    };

    this.setPipe = function(pipe) {
      this.pipe = pipe;
    };

    this.onReceiveWrapper = function(raw) {
      this.onReceive(unescape(raw.data.msg), raw.time);
    };

    return this;
  },


  // Errors as documented on http://www.ape-project.org/wiki/index.php/Errors_code
  errors: [
    {code:'001', msg:'A needed parameter is missing'},
    {code:'002', msg:'An unknown command has been sent'},
    {code:'003', msg:'Command missing. Maybe you forgot to pass your command in an array like [{"cmd":"...'},
    {code:'004', msg:'An unknown sessid has been sent '},
    {code:'005', msg:'The JSON is not well-formed'},
    {code:'007', msg:'Nickname already in use'},
    {code:'250', msg:'The challenge number sent is invalid'}
  ],

  channels: {},

  initConfig: function() {
	  ape_config(); // server-dependent defined in ape_config.js file
  },

  init: function(onReady) {

    this.onReady = onReady || this.onReadyDefault;

    this.initConfig();

    // Instantiate APE Client
    this.client = new APE.Client();

    // Load APE Core
    this.client.load();

    // Intercept 'load' event. This event is fired when the Core is loaded and ready to connect to APE Server
    this.client.addEvent('load', this.onLoad.bindAsEventListener(this));

    // Listen to the ready event to know when your client is connected
    this.client.addEvent('ready', this.onReady.bindAsEventListener(this));

    // add handlers for all errors
    var i;
    var error;
    for(i=0; i < this.errors.length; i++) {
      error = this.errors[i];

      // Specifically handle 007: Nickname already in use
      if(error.code == '007') {
        this.client.onError('007', this.retryCoreStart.bindAsEventListener(this));
	      continue;
      }

      this.client.onError(error.code, this.buildErrorHandler(error));
    }


  },

  randomString: function(len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var str = '';
    var rnum;
    var i;

    for (i=0; i < len; i++) {
      rnum = Math.floor(Math.random() * chars.length);
      str += chars.substring(rnum, rnum+1);
    }

    return str;
  },


  onLoad: function() {
    // connect to APE server
    this.client.core.start({"name": this.randomString(16)});
  },

  // called when onLoad fails because of nickname collision
  retryCoreStart: function() {
    this.onLoad();
  },

  buildErrorHandler: function(error) {
    return new Function("alert('APE error "+error.code+": "+error.msg+"');").bindAsEventListener(this);
  },

  onReadyDefault: function() {
    console.log('APE is connected and ready!');

  },

  onChannelJoined: function(pipe, options) {
    var chan = this.channels[pipe.name];
    if(!chan) {
      alert("Join event for unknown channel: " + pipe.name);
      return false;
    }
    chan.setPipe(pipe);

    // Handle reception of "data"-raw on the pipe
    pipe.onRaw('data', chan.onReceiveWrapper.bindAsEventListener(chan));

    if(chan.onReady) {
      chan.onReady();
    }
  },

  joinChannel: function(channelName, onReceive, onReady) {
    var chan = new this.Channel(channelName, onReceive, onReady);
    this.channels[channelName] = chan;

    this.client.addEvent('multiPipeCreate', this.onChannelJoined.bindAsEventListener(this));

    this.client.core.join(channelName);
    return chan;
  }

};
     
