module ApplicationHelper

  def title(str=nil)
    if str
      @tile_val = ActiveSupport::Inflector.titleize(str)
    end
    @tile_val || ''
  end

end
