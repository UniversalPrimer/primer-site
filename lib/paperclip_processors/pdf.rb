  # Handles thumbnailing images that are uploaded.
  class Pdf < Paperclip::Processor
    include Paperclip

    attr_accessor :target_geometry, :whiny, :convert_options

    # Creates a Thumbnail object set to work on the +file+ given. It
    # will attempt to transform the image into one defined by +target_geometry+
    # which is a "WxH"-style string. +format+ will be inferred from the +file+
    # unless specified. Thumbnail creation will raise no errors unless
    # +whiny+ is true (which it is, by default. If +convert_options+ is
    # set, the options will be appended to the convert command upon image conversion
    def initialize file, options = {}, attachment = nil
      super

      geometry             = options[:geometry]
      @file                = file
      @target_geometry     = Geometry.parse geometry
      @convert_options     = options[:convert_options]
      @whiny               = options[:whiny].nil? ? true : options[:whiny]

      @source_file_options = @source_file_options.split(/\s+/) if @source_file_options.respond_to?(:split)
      @convert_options     = @convert_options.split(/\s+/)     if @convert_options.respond_to?(:split)

      @current_format      = File.extname(@file.path)
      @basename            = File.basename(@file.path, @current_format)

    end


    # Performs the conversion of the +file+ into a thumbnail. Returns the Tempfile
    # that contains the new image.
    def make
      src = @file
      dst = Tempfile.new([@basename, 'png'].compact.join("."))
      dst.binmode
      

      parms = []
      parms << "-size #{@target_geometry.width.to_i}x#{@target_geometry.height.to_i}"
      parms << "-quality 95"
      parms << convert_options
      parms << "#{File.expand_path(src.path)}[0]"
      parms << File.expand_path(dst.path)
      
      parameters = parms.flatten.compact.join(" ").strip.squeeze(" ")
      
      
#      Rails.logger.info @file.path
#      Rails.logger.info '========== gm convert ' + parameters
      #        success = Paperclip.run('gm convert', parameters)
      # success = Paperclip::CommandLine.new('gm convert', parameters, :expected_outcodes => [0, 1]).run

      output = `gm convert #{parameters}`
      if ! [0, 1].include?($?.exitstatus)
        raise PaperclipError, "There was an error converting pdf to png: #{output} #{e}" if @whiny
      end

#        success = Paperclip.run('gm convert', parameters)



      Rails.logger.info '========== tmpfile: ' + dst.path

      return dst
#      return ' s'
    end

# Note that 95 is the best quality for PNG,
# that the 9 and 5 denote different aspects of compression
# and that PNG is losless so the setting only affects file size and cpu usage
#
# gm convert -size 800x600 -quality 95 sample.pdf[0] out.png
# gm convert -size 800x600 -quality 95 sample.pdf out%d.png

  end

