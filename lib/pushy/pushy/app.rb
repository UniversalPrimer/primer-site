require 'pushy/session_tracker'
require 'pushy/transport'
require 'pushy/channel'

module Pushy
  class App

    ASYNC_CALLBACK = "async.callback".freeze
    
    AsyncResponse = [-1, {}, []].freeze
    InvalidResponse = [500, {"Content-Type" => "text/html"}, ["Invalid request"]].freeze
    
    attr_reader :session_key, :channel_key, :channel, :logger, :ping_interval
    
    # Create a new Pushy Rack app.
    # Options:
    #   session_key: the key in which the session unique ID will be passed in the request
    #   channel_key: the key in which the channel unique ID will be passed in the request
    #   channel: a channel object to subscribe to on new connections
    #   logger: Logger instance to log to
    #   ping_interval: interval at which to send ping message to clients
    def initialize(options={})
      @session_key = options[:session_key] || "session_id"
      @channel_key = options[:channel_key] || "channel_id"
      @channel = options[:channel] || Channel::AMQP.new
      @logger = options[:logger] || Logger.new(STDOUT)
      @ping_interval = options[:ping_interval] || 5
      @started = false
      @session_tracker = SessionTracker.new
    end
    
    def call(env)

      on_start unless @started
      
      puts "ENV CLASS: " + env.class.to_s

      request = Rack::Request.new(env)
      channel_id = request[@channel_key]
      session_id = request[@session_key]
      
      return InvalidResponse unless channel_id && session_id
      @logger.info "Connection on channel #{channel_id} from #{session_id}" if @logger
   

      session = @session_tracker.find(session_id)
      if session
        session.update
        new_session = false
      else
        new_session = true
        session = @session_tracker.start(session_id)
      end

      puts "=========="
      puts "incoming request with transport: " + request["transport"]
   
      transport = Transport.select(request["transport"]).new(request, session)
      transport.on_close { @logger.info "Connection closed on channel #{channel_id} from #{session_id}" } if @logger
      
      @channel.subscribe(channel_id, session_id, transport)
      
      EM.next_tick { env[ASYNC_CALLBACK].call transport.render }
#      EM.next_tick { puts "ENV: " + env.inspect.to_s }

#      EM.next_tick { "async.callback".freeze.call transport.render }
      
      if new_session
        EM.next_tick { transport.write_welcome }
      end

#      throw :async
      AsyncResponse
    end
    
    private
      def on_start
        EM.add_periodic_timer(@ping_interval) { Transport.ping_all }
        EM.add_periodic_timer(SESSION_TIMEOUT * 60 + 1) { @session_tracker.cleanup }
        @started = true
      end

  end
end
