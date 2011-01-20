module Pushy
  module Transport
    class LongPoll < Base
      register :long_poll
      register :default

      # TODO Find max time for long polling before we need to force reconnect      
      def write_raw(escaped_data)
        # Safari requires a padding of 256 bytes to render
        renderer.call [" " * 256 + escaped_data]
        EM.next_tick { renderer.succeed }
      end
    end
  end
end
