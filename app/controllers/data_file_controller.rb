class DataFileController < ApplicationController

  def image

    @dfile = DataFile.find_by_md5(params[:md5])
    page = params[:page] || 0
    size = params[:size] || 'medium'
    
    #render :image => @dfile.image_path
    # TODO content type should auto
    send_file @dfile.image_path(page, size), :type => 'image/png', :disposition => 'inline'

  end


end
