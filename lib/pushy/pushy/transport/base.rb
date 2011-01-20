require "pushy/deferrable_body"

module Pushy
  module Transport
    OPENED = []
    BACKENDS = {}

    def self.select(transport)
      BACKENDS[transport] || BACKENDS["default"]
    end
    
    def self.ping_all
      OPENED.each { |transport| transport.ping }
    end
    
    class Base
      attr_reader :request, :renderer
      
      def initialize(request, session)
        @session = session
        @request = request
        @renderer = DeferrableBody.new
        opened
        OPENED << self
        on_close do
          OPENED.delete(self)
        end
      end
            
      def headers
        {'Content-Type' => 'text/html'}
      end
      
      def render
        [200, headers, @renderer]
      end
      
      def opened
      end

      def write(data)
        # this escape is identical to javascript's encodeURIComponent
        escaped = URI.escape(data, Regexp.new("[^#{URI::PATTERN::UNRESERVED}]"))
        write_raw(escaped)
      end

      def write_welcome
        puts "writing WELCOME"
        message = {
          :session_id => @session.id,
          :session_msg_count => @session.next_msg_count,
          :type => 'welcome'
        }.to_json

        write(message)
      end

      # called when messages are received through AMQP
      def write_message(json_data)

        begin
          data = JSON.parse(json_data)

          message = {
            :session_id => @session.id,
            :session_msg_count => @session.next_msg_count,
            :type => 'data',
            :data => data
          }.to_json

          write(message)

        rescue Exception => e
          puts "ERROR: illegal data received"
        end
      end

      def ping
        puts "pinging"
        renderer.call [' ']
      end      

      def close
        renderer.succeed
      end

      def on_close(&block)
        renderer.callback(&block)
        renderer.errback(&block)
      end
      
      def closed?
        renderer.closed?
      end
      
      def self.register(name)
        BACKENDS[name.to_s] = self
      end
    end

  end
end
