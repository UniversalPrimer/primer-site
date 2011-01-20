module Pushy
  module Transport
    class HTMLFile < Base
      MAX_BYTES_SENT = 1048476 # Magic number taken from Orbited - 100 bytes for connection close

      register :html_file
      
      def headers
        {'Content-Type' => 'text/html'}
        {'Cache-Control' => 'no-cache, must-revalidate'}
        {'Pragma' => 'no-cache'}
        {'Expires' => '-1'}
      end
      
      def opened

        puts "opened new htmlfile connection"

        initial_data = <<DATA
          <html>
            <head>
              <script type='text/javascript'></script>
            </head>
            <body>
DATA

        initial_data += ' ' * [0, 256 - initial_data.length].max + "\n" # ensure minimum 256 initial bytes

        @sent = initial_data.length
        renderer.call [initial_data]
      end
      
      def write_raw(escaped_data)

        puts "writing"

        js = "parent.htmlfile_received(\"#{escaped_data}\");"
        data = "<script type='text/javascript'>#{js}</script>"

        soon_sent = @sent + data.size

        if soon_sent > MAX_BYTES_SENT
          #          EM.next_tick { renderer.succeed }
          close
        else
          @sent = soon_sent
          renderer.call [data]
        end
      end


      def close
        # TODO send JS for connection complete (inside <script> tag)
        EM.next_tick { renderer.succeed }
      end

      def ping
        # TODO call javascript heartbeat function
        puts "pinging"
        js = "parent.htmlfile_ping();"
        data = "<script type='text/javascript'>#{js}</script>"
        @sent += data.size
        renderer.call [data]
      end

    end
  end
end
