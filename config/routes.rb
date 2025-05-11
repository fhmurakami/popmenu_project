Rails.application.routes.draw do
  resources :menus do
    resources :menu_items, as: :items
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Route to catch any other request and redirect to React
  get "*path", to: "menus#index", constraints: ->(request) do
    !request.xhr? && request.format.html?
  end

  # Catch-all route for any other request and redirect to React
  # match "*path", to: "home#index", via: :all
end
