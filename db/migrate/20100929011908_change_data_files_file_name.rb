class ChangeDataFilesFileName < ActiveRecord::Migration
  def self.up
    remove_column :data_files, :file_name
    add_column :data_files, :file_path, :string
  end

  def self.down
    remove_column :data_files, :file_path
    add_column :data_files, :file_name, :string
  end
end
