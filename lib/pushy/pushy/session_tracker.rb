require 'pushy/session'

puts "LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOAD"

module Pushy

  SESSION_TIMEOUT = 5

  class SessionTracker

    def initialize
      @sessions = {}
    end

    def find(session_id)
      @sessions[session_id]
    end

    def start(session_id)
      if @sessions[session_id]
        raise 'session already exists'
      end
      @sessions[session_id] = Session.new(self, session_id)
    end

    def find_or_start(session_id)
      ses = find(session_id)
      if ses
        return ses
      end
      start(session_id)            
    end

    def stop(session_id)
      @sessions.delete(session_id)
    end

    def update(session_id)
      if @sessions.has_key?(session_id)
        @sessions[session_id].update
      end
    end

    # runs every SESSION_TIMEOUT minutes ( + 1 second )
    def cleanup
      @sessions.each_pair do |session_id, session|
        if session.timed_out?
          @sessions.delete(session_id)
        end
      end
    end
  end

  class Session
    
    attr_reader :tracker, :id, :message_count, :last_active_time

    def initialize(tracker, id, message_count=0)
      @tracker = tracker
      @id = id
      @message_count = message_count
      update
    end

    def update
      @last_active_time = Time.now
    end

    def next_msg_count
      count = @message_count
      @message_count += 1
      count
    end
    
    def timed_out?
      if (@last_active_time + 60 * SESSION_TIMEOUT) < Time.now
        return true
      end
      return false
    end

    def stop
      @tracker.stop(@id)
    end

  end
end
