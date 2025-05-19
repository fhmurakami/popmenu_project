require "rails_helper"
require "rake"

RSpec.describe "import:restaurants", type: :task do
  let(:task_name) { "import:restaurants" }
  let(:task) do
    Rake.application.rake_require('tasks/import')
    Rake::Task.define_task(:environment)
    Rake::Task[task_name]
  end

  let(:fixtures_file_path) { Rails.root.join("spec/fixtures/restaurants.json") }
  let(:missing_file_path) { "tmp/missing.json" }
  let(:exception_file_path) { "tmp/exception.json" }

  before do
    task.reenable
    allow($stdout).to receive(:puts) # silence stdout to keep it clean
  end

  context "when no file path is provided" do
    it "prints usage error and exits" do
      expect { task.invoke }.to raise_error(SystemExit)
      expect($stdout).to have_received(:puts).with(/Error: File path is required/)
    end
  end

  context "when file does not exist" do
    it "prints file not found error and exits" do
      allow(File).to receive(:exist?).with(missing_file_path).and_return(false)

      expect { task.invoke(missing_file_path) }.to raise_error(SystemExit)
      expect($stdout).to have_received(:puts).with(/Error: File not found/)
    end
  end

  context "when import is successful with all log levels" do
    it "prints success message and logs" do
      # Use the actual fixtures file
      json_content = File.read(fixtures_file_path)

      allow(File).to receive(:exist?).with(fixtures_file_path).and_return(true)
      allow(File).to receive(:read).with(fixtures_file_path).and_return(json_content)

      # Create example logs with all log levels to ensure full coverage
      logs = [
        { level: "info", message: "Created restaurant" },
        { level: "warning", message: "No menus found" },
        { level: "error", message: "Missing price" }
      ]

      service = instance_double(RestaurantImportService)
      allow(RestaurantImportService).to receive(:new).and_return(service)
      allow(service).to receive(:import).with(json_content).and_return({ success: true, logs: logs })

      expect { task.invoke(fixtures_file_path) }.to raise_error(SystemExit)
      expect($stdout).to have_received(:puts).with("Import successful")
      expect($stdout).to have_received(:puts).with("  [INFO] Created restaurant")
      expect($stdout).to have_received(:puts).with("  [WARNING] No menus found")
      expect($stdout).to have_received(:puts).with("  [ERROR] Missing price")
    end
  end

  context "when import fails" do
    it "prints failure message and exits with code 1" do
      json_content = File.read(fixtures_file_path)

      allow(File).to receive(:exist?).with(fixtures_file_path).and_return(true)
      allow(File).to receive(:read).with(fixtures_file_path).and_return(json_content)

      service = instance_double(RestaurantImportService)
      allow(RestaurantImportService).to receive(:new).and_return(service)
      allow(service).to receive(:import).with(json_content).and_return({
        success: false,
        logs: [ { level: "error", message: "Bad data" } ]
      })

      expect { task.invoke(fixtures_file_path) }.to raise_error(SystemExit)
      expect($stdout).to have_received(:puts).with("Import failed")
      expect($stdout).to have_received(:puts).with("  [ERROR] Bad data")
    end
  end

  context "when file reading raises an exception" do
    it "prints the error and exits with code 1" do
      allow(File).to receive(:exist?).with(exception_file_path).and_return(true)
      allow(File).to receive(:read).with(exception_file_path).and_raise("Boom!")

      expect { task.invoke(exception_file_path) }.to raise_error(SystemExit)
      expect($stdout).to have_received(:puts).with(/Error: Boom!/)
    end
  end
end
