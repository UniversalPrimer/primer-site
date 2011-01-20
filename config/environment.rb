# Load the rails application
require File.expand_path('../application', __FILE__)


# Start EventMachine in its own thread (for Pushy)
# TODO need to do some checks to see if Thin is in use (which loads EM on its own)
# but there are some problems with Thin that haven't been solved

=begin
Thread.new do

  while true
    begin
      
      $: << Rails.root.join('lib', 'pushy')
      require 'pushy'
      EM.run
      
    rescue Exception => e
      # XXX figure out how to recover from this
      $stderr.puts "Error happened inside EventMachine thread: #{e.message}"
      $stderr.puts "NOTE: Cannot recover. You need to restart the server."
      $stderr.puts "---------------------------------------"
      $stderr.puts e.backtrace.join("\n")
    end
  end

end
=end


# Initialize the rails application
PrimerSites::Application.initialize!



