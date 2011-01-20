class FooController < ApplicationController
  layout 'foo'

  def test

    @hostname = request.host
    

  end



end



