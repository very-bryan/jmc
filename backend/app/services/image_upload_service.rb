require "aws-sdk-s3"
require "mini_magick"
require "securerandom"

class ImageUploadService
  BUCKET = ENV.fetch("S3_BUCKET", "jmc-images")
  REGION = ENV.fetch("S3_REGION", "us-east-1")
  MAX_LONG_SIDE = 2048

  def self.client
    @client ||= Aws::S3::Client.new(
      endpoint: ENV.fetch("S3_ENDPOINT", "http://221.143.48.200:9000"),
      access_key_id: ENV.fetch("S3_ACCESS_KEY", "9S2E0PfbdiZkVln0o36V"),
      secret_access_key: ENV.fetch("S3_SECRET_KEY", "9S2E0PfbdiZkVln0o36V"),
      region: REGION,
      force_path_style: true # MinIO/RustFS 호환
    )
  end

  # 이미지 파일을 받아서 WebP로 변환 + 리사이즈 + 업로드
  # Returns: { url: "https://...", key: "images/..." }
  def self.upload(file, folder: "images")
    # 임시 파일로 저장
    temp_input = Tempfile.new([ "upload", File.extname(file.original_filename || ".jpg") ])
    temp_input.binmode
    temp_input.write(file.read)
    temp_input.rewind

    # MiniMagick으로 처리
    image = MiniMagick::Image.new(temp_input.path)

    # 리사이즈: 가장 긴 변을 2048px로
    if image.width > MAX_LONG_SIDE || image.height > MAX_LONG_SIDE
      image.resize "#{MAX_LONG_SIDE}x#{MAX_LONG_SIDE}>"
    end

    # WebP 변환
    temp_output = Tempfile.new([ "converted", ".webp" ])
    image.format "webp"
    image.quality 85
    image.write temp_output.path

    # S3 업로드
    key = "#{folder}/#{SecureRandom.uuid}.webp"
    temp_output.rewind

    client.put_object(
      bucket: BUCKET,
      key: key,
      body: File.read(temp_output.path),
      content_type: "image/webp",
      acl: "public-read"
    )

    url = "#{ENV.fetch('S3_ENDPOINT', 'http://221.143.48.200:9000')}/#{BUCKET}/#{key}"

    # 정리
    temp_input.close!
    temp_output.close!

    { url: url, key: key }
  rescue StandardError => e
    Rails.logger.error("Image upload failed: #{e.message}")
    { error: e.message }
  end

  # Base64 이미지 업로드 (모바일 앱용)
  def self.upload_base64(base64_string, folder: "images")
    # data:image/jpeg;base64,... 형식 파싱
    if base64_string.start_with?("data:")
      content_type, data = base64_string.split(",", 2)
      ext = content_type.match(%r{image/(\w+)})[1] rescue "jpg"
    else
      data = base64_string
      ext = "jpg"
    end

    decoded = Base64.decode64(data)

    temp_input = Tempfile.new([ "upload", ".#{ext}" ])
    temp_input.binmode
    temp_input.write(decoded)
    temp_input.rewind

    # MiniMagick 처리
    image = MiniMagick::Image.new(temp_input.path)

    if image.width > MAX_LONG_SIDE || image.height > MAX_LONG_SIDE
      image.resize "#{MAX_LONG_SIDE}x#{MAX_LONG_SIDE}>"
    end

    temp_output = Tempfile.new([ "converted", ".webp" ])
    image.format "webp"
    image.quality 85
    image.write temp_output.path

    key = "#{folder}/#{SecureRandom.uuid}.webp"

    client.put_object(
      bucket: BUCKET,
      key: key,
      body: File.read(temp_output.path),
      content_type: "image/webp",
      acl: "public-read"
    )

    url = "#{ENV.fetch('S3_ENDPOINT', 'http://221.143.48.200:9000')}/#{BUCKET}/#{key}"

    temp_input.close!
    temp_output.close!

    { url: url, key: key }
  rescue StandardError => e
    Rails.logger.error("Base64 image upload failed: #{e.message}")
    { error: e.message }
  end

  # 버킷 존재 확인 (초기 설정용)
  def self.ensure_bucket!
    client.head_bucket(bucket: BUCKET)
  rescue Aws::S3::Errors::NotFound, Aws::S3::Errors::NoSuchBucket
    client.create_bucket(bucket: BUCKET)
  rescue StandardError => e
    Rails.logger.warn("Bucket check failed: #{e.message}")
  end
end
