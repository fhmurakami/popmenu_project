class Api::V1::RestaurantImportsController < ApplicationController
  def create
    # Check if file is provided
    unless params[:file].present?
      render json: { success: false, logs: [ { level: "error", message: "No file provided" } ] }, status: :bad_request
      return
    end

    # Read the file content
    begin
      file_content = params[:file].read

      # Initialize service and import data
      import_service = RestaurantImportService.new
      result = import_service.import(file_content)

      # Return the result with appropriate status
      status = result[:success] ? :ok : :unprocessable_entity
      render json: result, status: status
    rescue StandardError => e
      render json: {
        success: false,
        logs: [ { level: "error", message: "File processing error: #{e.message}" } ]
      }, status: :internal_server_error
    end
  end
end
