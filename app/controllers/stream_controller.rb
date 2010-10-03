class StreamController < ApplicationController
  include UploadUtils
  layout 'stream'
  
  def show

    # TODO hackish
    stream_name = (params[:stream_name] == 'show') ? params[:stream_name2] : params[:stream_name]

    @stream = Stream.find_by_name(stream_name)
    if !@stream
      @stream = Stream.new(params[:stream])
      @stream.name = stream_name
      @stream.save!
    else
      @stream.attributes = params[:stream]
    end

    if request.post?
      handle_upload(params)
      render :text => "success!" # TODO: JSON output
      return
    end

  end

  def get_slide_image_url
    require 'json'

    cmd = JSON.parse(params[:json])

    if !cmd['md5']
      render :status => 404, :txt => {
        :status => 'error',
        :msg => 'md5 argument required but missing'
      }.to_json
      return
    end      

    md5 = cmd['md5']
    page = cmd['page'] || '0'
    size = cmd['size'] || 'medium'

    @dfile = DataFile.find_by_md5(md5);
    if !@dfile
      render :status => 404, :txt => {
        :status => 'error',
        :msg => 'data file not found'
      }.to_json
      return
    end

    render :txt => {
      :status => 'success',
      :url => DataFile.image_url(page, size)
    }.to_json
  end


  
#  private

    def handle_upload(params)
      
      @dfile = DataFile.new
      @dfile.stream = @stream
      @dfile.user = current_user
      @dfile.save!

      # file-handling magic happens here
      @dfile.file = params[:file]

      @dfile.save!

#      render :text => "uploaded: #{@stream.name} with file: <a href='#{@dfile.file_path_url}'>here</a>"

    end



end
