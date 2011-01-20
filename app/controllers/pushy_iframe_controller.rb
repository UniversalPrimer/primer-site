class PushyIframeController < ApplicationController
  layout 'pushy_iframe'

  def index
    @domain = params[:domain]
  end

end
