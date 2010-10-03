class CreateDataFiles < ActiveRecord::Migration
  def self.up
    create_table :data_files do |t|
      t.integer :user_id
      t.string :file_name
      t.string :content_type
      t.integer :file_size

      t.timestamps
    end
  end

  def self.down
    drop_table :data_files
  end
end
