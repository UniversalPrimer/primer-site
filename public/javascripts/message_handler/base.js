
var MessageHandler = {

    modules: {}, // instances of modules, keyed by stream name

    parse: function(message_str) {
        return message_str.evalJSON(true)
    },
    
    join_stream: function(stream_name, module) {
        
        if(modules[stream_name]) {
            this.error("Another module is using this stream name: " + stream_name);
            return;
        }
        modules[stream_name] = module;
    },

    part_stream: function(stream_name) {
        // XXX write remove code
    },

    // Handle an incoming message. Called by Pushy
    handle_incoming: function(message_str) {
        var message = this.parse(message_str);
        var i;
        var module = this.modules[message.stream_name];
        if(!module) {
            this.error("Message with unknown stream: " + message.stream_name);
            return false;
        }
        module.incoming_message(message);        
    },

    // turn message into JSON and send using Pushy
    send: function(message, module, stream_name) {
        
    },

    // TODO improve error handling
    error: function(str) {
        alert(str);
    }

}