Rails.application.routes.draw do
  # Auth routes
  post "/auth/login", to: "auth#login"
  post "/auth/register", to: "auth#register"
  get "/auth/me", to: "auth#me"
  patch "/auth/avatar", to: "auth#update_avatar"

  # Tasks routes
  resources :tasks do
    member do
      post :create_subtask
    end
  end

  # Subtask routes with task_id and subtask_id
  patch "/tasks/:task_id/update_subtask/:subtask_id", to: "tasks#update_subtask"
  delete "/tasks/:task_id/destroy_subtask/:subtask_id", to: "tasks#destroy_subtask"

  # Keep todos for backward compatibility
  resources :todos

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
