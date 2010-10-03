class DataFileStreamAssocation < ActiveRecord::Migration
  def self.up
    add_column :data_files, :stream_id, :integer
  end

  def self.down
    remove_column :data_files, :stream_id
  end
end
