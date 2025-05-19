namespace :import do
  desc "Import restaurant data from a JSON file"
  task :restaurants, [ :file_path ] => :environment do |t, args|
    # Check if file path is provided
    unless args[:file_path].present?
      puts "Error: File path is required"
      puts "Usage: rake import:restaurants[path/to/file.json]"
      exit(1)
    end

    # Check if file exists
    file_path = args[:file_path]
    unless File.exist?(file_path)
      puts "Error: File not found at '#{file_path}'"
      exit(1)
    end

    # Read the file content
    begin
      file_content = File.read(file_path)

      # Initialize service and import data
      import_service = RestaurantImportService.new
      result = import_service.import(file_content)

      # Output the results
      puts "Import #{result[:success] ? 'successful' : 'failed'}"
      puts "Logs:"
      result[:logs].each do |log|
        case log[:level]
        when "info"
          puts "  [INFO] #{log[:message]}"
        when "warning"
          puts "  [WARNING] #{log[:message]}"
        when "error"
          puts "  [ERROR] #{log[:message]}"
        end
      end

      exit(result[:success] ? 0 : 1)
    rescue StandardError => e
      puts "Error: #{e.message}"
      exit(1)
    end
  end
end
