require 'rails_helper'

RSpec.describe Api::V1::RestaurantImportsController, type: :controller do
  describe "POST #create" do
    context "with valid file" do
      let(:valid_json) do
        {
          restaurants: [
            {
              name: "Test Restaurant",
              menus: [
                {
                  name: "lunch",
                  menu_items: [
                    { name: "Burger", price: 9.0 },
                    { name: "Salad", price: 5.0 }
                  ]
                }
              ]
            }
          ]
        }.to_json
      end

      it "imports the restaurant data and returns success" do
        # Create a temporary file with the JSON content
        file = Tempfile.new([ 'restaurant_data', '.json' ])
        file.write(valid_json)
        file.rewind

        # Create the uploaded file
        uploaded_file = fixture_file_upload(file.path, 'application/json')

        expect {
          post :create, params: { file: uploaded_file }
        }.to change(Restaurant, :count).by(1)
          .and change(Menu, :count).by(1)
          .and change(MenuItem, :count).by(2)
          .and change(MenuEntry, :count).by(2)

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['success']).to be true

        file.close
        file.unlink
      end
    end

    context "with no file" do
      it "returns a bad request error" do
        post :create

        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)['success']).to be false
        expect(JSON.parse(response.body)['logs'].first['message']).to include('No file provided')
      end
    end

    context "with invalid JSON" do
      it "returns an unprocessable entity error" do
        # Create a temporary file with invalid JSON
        file = Tempfile.new([ 'invalid_data', '.json' ])
        file.write('{ invalid json }')
        file.rewind

        # Create the uploaded file
        uploaded_file = fixture_file_upload(file.path, 'application/json')

        post :create, params: { file: uploaded_file }

        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['success']).to be false

        file.close
        file.unlink
      end
    end

    context "when file processing raises an unexpected error" do
      it "returns an internal server error" do
        # Create a mock file that will raise an error when read
        file_mock = instance_double(File)
        allow(file_mock).to receive(:read).and_raise(StandardError.new("Test error"))

        # Use the controller params directly instead of using fixture_file_upload
        allow(controller).to receive(:params).and_return(
          ActionController::Parameters.new(
            file: file_mock
          )
        )

        post :create

        expect(response).to have_http_status(:internal_server_error)
        expect(JSON.parse(response.body)['success']).to be false
        expect(JSON.parse(response.body)['logs'].first['message']).to include('File processing error: Test error')
      end
    end
  end
end
