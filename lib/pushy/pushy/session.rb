module Pushy

  SESSION_TIMEOUT = 5

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
