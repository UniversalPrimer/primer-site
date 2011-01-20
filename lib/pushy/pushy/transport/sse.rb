module Pushy
  module Transport
    class Sse < Base
      register :sse
      
      def headers
        {'content-type' => 'application/x-dom-event-stream',
        'cache-control' => 'no-cache, must-revalidate'}
      end
      
      def write_raw(escaped_data)
        puts "writing sse"

        out = "Event: data-event\n"
        out += escaped_data.split("\n").map { |datum| "data: #{datum}\n" }.join
        out += "\n"

        renderer.call [out]

      end

      def ping 
        puts "pinging"
        renderer.call ["Event: ping\n\n"]
      end

    end
  end
end
