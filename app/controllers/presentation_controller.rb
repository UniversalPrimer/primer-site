class PresentationController < ApplicationController

  def list
    @presentations = Presentation.find(:all, :order => 'pdf_updated_at')    
  end
    


end
