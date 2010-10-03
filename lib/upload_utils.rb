module UploadUtils

  # checks if filename already exists in dirpath,
  # adds an index to the name so that the filename is unique in the dir
  # and returns the unique filename

  def unique_filename(dirpath, filename)
    i = 0
    new_name = filename

    while FileTest.exists?(dirpath + new_name)
      name, extension = *filename_parts(filename)
      new_name = name + '_' + i.to_s + '.' + extension
      i += 1
    end
    return new_name
  end

  def sanitize_filename(file_name)
    just_filename = File.basename(file_name) 
    # replace all non-alphanumeric, underscore or periods with underscores
    just_filename.gsub(/[^\w\.\-]/,'_') 
  end


  def calculate_md5(filepath)
    out = `md5sum -b #{filepath} 2>&1`
    if !$?.success?
      raise "Error calculating MD5 checksum for: #{filepath}"
    end

    m = out.match(/^([^\s]+)/)
    if !m
      return nil
    else
      return m[0]
    end
  end

end
