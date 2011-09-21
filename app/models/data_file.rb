class DataFile < ActiveRecord::Base
  include UploadUtils

  belongs_to :user
  belongs_to :stream

  # aspect ratios are kept
  # so these are really maximum sizes
  @@sizes = {
    'tiny' => '160x120',
    'small' => '320x240',
    'medium' => '640x480',
    'large' => '1280x1024'
  }

  def storage_dir
    if !self.id
      raise "can't get storage directory for data file when it doesn't have an id"
    end

    pub_path = Pathname.new(Rails.public_path)
    dir = pub_path.join('files')
    # a dir like: public/files/streams/16/datafiles/32/
    dir = dir.join(id.to_s)
  end

  def sizes_dir
    storage_dir.join('sizes')
  end

#  def path_to(version


  def file=(f)

#    if f.instance_of?(Tempfile)
#      raise "lol"
#    end


    # create storage dir (if it doesn't exist)
    path = storage_dir
    FileUtils.mkdir_p(path)    

    # write file data to temp file
    tmp = Tempfile.new('data_file')
    tmp.write(f.read)
    tmp.close

    # if there already was a file associated
    if self.file_path
      if compare_md5(tmp.path)
        raise SameFileException.new("New file identical to old file")
      end
    end

    # move the temp file to the storage dir
    filename = sanitize_filename(f.original_filename)    
    filepath = path.join(filename)
    FileUtils.mv(tmp.path, filepath)

    self.file_path = filepath
    self.content_type = f.content_type
    self.file_size = f.size
    
    update_md5

    if resizable?
      create_sizes
    end

  end

  def image_url(page=0, size='medium')
    pub_path = Pathname.new(Rails.public_path)
    filepath = image_path(page, size)
    '/' + filepath.relative_path_from(pub_path)
  end

  def image_path(page=0, size='medium')
    if is_multiple?
      filename = "#{size}_#{page.to_s}.png"
    else
      filename = "#{size}.png"
    end
#    raise filename
    filepath = sizes_dir.join(filename)
  end

  def compare_md5(filepath)
    if self.md5 == calculate_md5(filepath)
      return true
    end
    false
  end

  def update_md5
    self.md5 = calculate_md5(self.file_path)
  end
  
  def file_path_url
    pub_path = Pathname.new(Rails.public_path)
    filepath = Pathname.new(self.file_path)
    '/' + filepath.relative_path_from(pub_path)
  end

  def resizable?
    # mimetypes that the system knows how to create resized versions of
    mimetypes = [
                 'application/pdf',
                 'application/postscript',
                 'image/svg+xml',
                 'image/svg-xml', # from old draft standard
                 'image/jpeg',
                 'iamge/png',
                 'image/gif',
                 'image/tiff',
                 'image/bmp',
                 'image/jp2', # jpeg 2000
                 'image/jpx', # jpeg 2000
                 'image/jpm', # jpeg 2000
                 'image/mj2'  # jpeg 2000
                 ]

    if mimetypes.include?(self.content_type)
      return true
    end
    false

  end

  def is_multiple?

    # mimetypes that can contain more than one page/subfile
    mimetypes = ['application/pdf']

    if mimetypes.include?(self.content_type)
      return true
    end
    false
  end

  # create the different resized versions of file
  def create_sizes
    path = sizes_dir
    FileUtils.mkdir_p(path)

    cmd = 'gm convert'

      args = []

    # quality 95 is most compressed png
    # this is desireable becaue png is lossless
    args << '-quality 95'


    # TODO add more
    out_format = 'png'

    @@sizes.each_pair do |name, size|

      if is_multiple?
        filepath = path.join("#{name}_%d.#{out_format}")
      else
        filepath = path.join("#{name}.#{out_format}")
      end

      # example: gm convert -quality 96 -size 320x240 /path/to/foo.png /output/to/small.png

      cmdline = "#{cmd} #{args.join(' ')} -resize #{size} #{self.file_path} #{filepath} 2>&1"

      out = `#{cmdline}`

      if !$?.success?
        raise "Error converting pdf to pngs: #{out}"
      end

    end

    # note: you can do: gm convert foo.pdf[0] bar.png
    # and it will only convert the first slide/page

  end
  

end


class SameFileException < Exception

end
