class DatafileAddMd5 < ActiveRecord::Migration
  def self.up
    add_column :data_files, :md5, :string
  end

  def self.down
    remove_column :data_files, :md5
  end
end
