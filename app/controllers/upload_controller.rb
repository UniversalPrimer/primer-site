class UploadController < ApplicationController

  before_filter :login_required

  def index
#    return if !request.post?
#    @present = Presentation.new(params[:presentation])
#    @present.save!
#    flash[:notice] = 'Presentation uploaded successfully!'
  end


  def authorized?
    return false if !current_user
    true
  end

end
