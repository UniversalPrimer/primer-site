class CreateStreams < ActiveRecord::Migration
  def self.up
    create_table :streams do |t|

      t.string :name, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :streams
  end
end
