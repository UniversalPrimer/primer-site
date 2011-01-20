module Pushy
  module Transport
    class SseNew < Base
      register :sse_new
      
      def headers
        {'content-type' => 'text/event-stream',
        'cache-control' => 'no-cache, must-revalidate'}
      end
      
      def write_raw(escaped_data)
        puts "writing sse new"

        out = "event: data\n"
        out += escaped_data.split("\n").map { |datum| "data: #{datum}\n" }.join
        out += "\n"

        renderer.call [out]

      end

      def ping 
        puts "pinging"
        out = "event: ping\n"
        out += "data: ping\n"
        out += "\n"
        renderer.call [out]
      end

    end
  end
end
