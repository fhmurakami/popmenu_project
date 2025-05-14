Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :restaurants, only: [ :index, :show, :create, :update, :destroy ] do
        resources :menus, only: [ :index, :show, :create, :update, :destroy ] do
          resources :menu_items, as: :items, only: [ :index, :show, :create, :update, :destroy ]
        end
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Catch-all route for React Router
  get "*path", to: "home#index", via: :all, constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  root "home#index"
end
