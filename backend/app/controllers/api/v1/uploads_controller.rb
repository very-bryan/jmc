module Api
  module V1
    class UploadsController < ApplicationController
      # POST /api/v1/uploads/image
      # Accepts: multipart file OR base64 string
      # Returns: { url: "...", key: "..." }
      def image
        result = if params[:file].present?
          ImageUploadService.upload(params[:file], folder: params[:folder] || "images")
        elsif params[:base64].present?
          ImageUploadService.upload_base64(params[:base64], folder: params[:folder] || "images")
        else
          { error: "파일 또는 base64 데이터가 필요합니다" }
        end

        if result[:error]
          render json: { error: result[:error] }, status: :unprocessable_entity
        else
          render json: { url: result[:url], key: result[:key] }, status: :created
        end
      end
    end
  end
end
