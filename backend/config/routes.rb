Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # Admin
  namespace :admin do
    root to: "dashboard#index"

    get "login", to: "sessions#new", as: :login
    post "login", to: "sessions#create"
    get "logout", to: "sessions#destroy", as: :logout

    resources :users, only: [ :index, :show ] do
      member do
        post :sanction
        post :unsuspend
      end
    end

    resources :reports, only: [ :index, :show ] do
      member do
        post :process_report
        post :dismiss
      end
    end

    resources :posts, only: [ :index, :show ] do
      member do
        post :hide
        post :remove
      end
    end

    resources :relationships, only: [ :index ]
    get "statistics", to: "statistics#index", as: :statistics

    resources :announcements, only: [ :index, :new, :create, :edit, :update, :destroy ]
    resources :pre_registrations, only: [ :index ]
  end

  namespace :api do
    namespace :v1 do
      # Auth
      post "auth/request_code", to: "auth#request_code"
      post "auth/verify_code", to: "auth#verify_code"
      post "auth/register", to: "auth#register"
      get "auth/me", to: "auth#me"

      # Profile
      resource :profile, only: [ :show, :update ], controller: "profiles"
      put "profile/selfie_verify", to: "profiles#selfie_verify"

      # Value Survey
      resource :value_survey, only: [ :show, :create, :update ]

      # Preference Filter
      resource :preference_filter, only: [ :show, :create, :update ]

      # Posts
      resources :posts, only: [ :index, :show, :create, :destroy ]

      # Feed
      get "feed", to: "feed#index"

      # Users / Profiles
      get "users/:id", to: "users#show"

      # Interests
      resources :interests, only: [ :index, :create ] do
        member do
          post :accept
          post :decline
        end
      end

      # Matches
      resources :matches, only: [ :index, :show ]

      # Conversations & Messages
      resources :conversations, only: [ :index, :show ] do
        resources :messages, only: [ :index, :create ]
      end

      # Blocks
      resources :blocks, only: [ :index, :create, :destroy ]

      # Reports
      resources :reports, only: [ :create ]

      # Relationships
      resources :relationships, only: [ :create ] do
        member do
          post :confirm
          post :end_relationship
        end
      end

      # Invite Codes
      resources :invite_codes, only: [ :index ] do
        collection do
          post :validate
        end
      end

      # Pre-registration
      post "pre_registrations", to: "pre_registrations#create"
      get "pre_registrations/count", to: "pre_registrations#count"
    end
  end
end
