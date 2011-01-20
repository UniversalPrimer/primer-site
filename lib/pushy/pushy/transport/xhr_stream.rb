module Pushy
  module Transport
    class XhrStream < Base
      MAX_BYTES_SENT = 1048576 # Magic number taken from Orbited
      
      register :xhr_stream
      
      def headers
        {'Content-Type','application/x-event-stream'}
      end
      
      def opened
        # Safari requires a padding of 256 bytes to render
        @sent = 256
        renderer.call [" " * 256]
      end
      
      def write_raw(escaped_data)
        puts "writing"
        @sent += escaped_data.size
        renderer.call [escaped_data]
        EM.next_tick { renderer.succeed } if @sent > MAX_BYTES_SENT
      end

      def ping
        puts "pinging"
        @sent += 1
        renderer.call [' ']
      end

    end
  end
end
