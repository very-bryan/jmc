Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "https://jmc-landing.verycloud.io", "https://jmc-backend.verycloud.io", "http://localhost:8081", "http://localhost:19006"

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
