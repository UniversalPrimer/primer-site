

Pushy.HtmlFile = Class.create(Pushy.Transport, {
  name: "html_file",
  
  htmlfile: null, // needed to prevent garbage collection

  before_unload: function() {
    this.disconnect();
  },

  unload: function() {
    this.on_unload();
  },

  htmlfile_received: function(data) {
    this.ping_received();
    if(data.length > 0) {
      this.received(data);
    }
  },

  htmlfile_ping: function() {
    this.ping_received();
    this.ping();
  },

  transport_send: function(msg) {

    var url = this.url;

    var len = 0;
    var self = this;

    this.ajax_request = new Ajax.Request(url, {
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


    this.htmlfile = new ActiveXObject('htmlfile'); // magical microsoft object
    this.htmlfile.open();
    this.htmlfile.write("<html><html>");
    this.htmlfile.close();

    this.htmlfile.parentWindow.htmlfile_received = this.htmlfile_received.bind(this);
    this.htmlfile.parentWindow.htmlfile_ping = this.htmlfile_ping.bind(this);

    var iframe_div = this.htmlfile.createElement('div');
    this.htmlfile.body.appendChild(iframe_div);
    var ifr = this.htmlfile.createElement('iframe');

    iframe_div.appendChild(ifr);
    ifr.src = this.url;

    // Alternate method for preventing garbage collection
    // setInterval( function () { }, 5000); 

    // Some info here: http://amix.dk/blog/post/19489

    /*
It's trivial to source scripts across domains (you simply append the SCRIPT tag to the head or the body). What's not trivial is finding out if the script was sourced properly and handling errors - and I haven't found a solution for this problem on the net. But there is a solution and it works like this:

    * for Internet Explorer we use script_tag.onreadystatechange to figure out if a success signal is set
    * for other browsers we use following knowledge: sourcing JavaScript is blocking, this means we append two script tags to the document where the first one is sourcing the JavasScript and the second one checks if a success signal is set

    */
  },
  
  transport_disconnect: function() {
    this.htmlfile = null;
    CollectGarbage();
  }

});
