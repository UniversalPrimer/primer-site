
//= require "version"
//= require "uuid"
//= require "transport"

function browser_unsupported() {
  alert('Your browser is not (yet) supported');
}

// Select transport depending on browser
if (Prototype.Browser.Gecko) {
  // TODO find out how far back XhrStreaming is supported
  // uprimer support is 3.0+

    Pushy.Transport = Pushy.XhrStream;

} else if (Prototype.Browser.WebKit) {
  // TODO find out how far back XhrStreaming is supported
  // uprimer support is 3.0+ for safari and 4.0+ for Chrome
  // (though Raphael currently limits us to 5.0+ for Chrome)
  Pushy.Transport = Pushy.XhrStream;

} else if (Prototype.Browser.Opera) {
  // uprimer support is 9.5+
  if((opera.version() >= 9.0) && (opera.version() <= 10.10)) {
    Pushy.Transport = Pushy.SSE;
  } else if((opera.version() > 10.10) && (opera.version() < 10.7)) {
    // there is a bug in these versions where only the first
    // even is sent, and subsequence events ignored
    // TODO test if these browsers work with Orbited
    // TODO if not, report bug to Opera and Orbited
      Pushy.Transport = Pushy.LongPoll;

  } else if(opera.version() < 9.0) {
    // we don't really care about < Opera 9 for the sake of Universal Primer
    // we could fall back to long polling maybe
    browser_unsupported();
  } else if(opera.version() >= 10.7) {
    // TODO Opera 10.7 and above should have support for
    // pure javascript-based SSE. We need to support this.
    Pushy.Transport = Pushy.SSENew;
  }
} else if (Prototype.Browser.IE) {
  // uprimer support is 6.0+
  // TODO don't support anything further back than IE 6
  Pushy.Transport = Pushy.HtmlFile;
} else {
  // TODO write check to see if long polling works
  Pushy.Transport = Pushy.LongPoll;
}

// Callback to be called when the transport has been created
// from within the iframe
Pushy.transportCreatedCallback = function() { }

// return the next hostname to be used
// and increment the count saved in the cookie
Pushy.nextHostname = function() {
  if(!this.cookiejar) {
    this.cookiejar = new CookieJar({
      expires: '' // session cookie
    });
  }

  var cookie_name = 'pushy_connect_count';
  var connect_count = parseInt(this.cookiejar.get(cookie_name));
  var new_connect_count = null;
  if(!connect_count) {
    this.cookiejar.put(cookie_name, 1);
    new_connect_count = 1;
  } else {
    this.cookiejar.remove(cookie_name);
    new_connect_count = connect_count + 1;
  }

  // XXXX temporary code for debug reasons
  if(new_connect_count > 20) {
    new_connect_count = 1;
  }

  // max length of a subdomain is 63 characters
  if(new_connect_count.toString().length > 63) {
    new_connect_count = 1; // wrap around
  }
  this.cookiejar.put(cookie_name, new_connect_count);


  return new_connect_count.toString() + '.' + this.domain;
}


// domain is the domain to use for document.domain
// all connections will be through n.domain where n is a number that
// increments on each new createTransport call (it is saved in a cookie)
Pushy.createTransport = function(domain, iframe_path, container_id, callback) {

  document.domain = domain;
  this.domain = domain;

  // TODO support https and other ports
  var url = 'http://' + this.nextHostname() + iframe_path + (iframe_path.include('?') ? '&' : '?') + Object.toQueryString({
          domain: domain
      });

  this.transportCreatedCallback = callback;
    
  var iframe = document.createElement('IFRAME');
  // TODO iframe shouldn't show up at all
  iframe.width = 200;
  iframe.height = 200;
  iframe.src = url;

  $(container_id).appendChild(iframe);
}