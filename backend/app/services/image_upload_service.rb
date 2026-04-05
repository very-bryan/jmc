require "aws-sdk-s3"
require "securerandom"
require "open3"
require "shellwords"

class ImageUploadService
  BUCKET = ENV.fetch("S3_BUCKET", "jmc-images")
  REGION = ENV.fetch("S3_REGION", "us-east-1")
  MAX_LONG_SIDE = 2048
  MAX_FILE_SIZE = 10.megabytes
  ALLOWED_CONTENT_TYPES = %w[image/jpeg image/png image/gif image/webp image/heic image/heif].freeze
  MAGIC_BYTES = {
    "\xFF\xD8\xFF" => "image/jpeg",
    "\x89PNG" => "image/png",
    "GIF8" => "image/gif",
    "RIFF" => "image/webp"
  }.freeze

  def self.client
    @client ||= Aws::S3::Client.new(
      endpoint: ENV.fetch("S3_ENDPOINT", "http://221.143.48.200:9000"),
      access_key_id: ENV.fetch("S3_ACCESS_KEY", ""),
      secret_access_key: ENV.fetch("S3_SECRET_KEY", ""),
      region: REGION,
      force_path_style: true
    )
  end

  def self.upload(file, folder: "images")
    return { error: "파일 크기가 10MB를 초과합니다" } if file.size > MAX_FILE_SIZE
    return { error: "허용되지 않는 파일 형식입니다" } unless ALLOWED_CONTENT_TYPES.include?(file.content_type)

    temp_input = Tempfile.new([ "upload", File.extname(file.original_filename || ".jpg") ])
    temp_input.binmode
    temp_input.write(file.read)
    temp_input.close

    return { error: "이미지 파일이 아닙니다" } unless valid_image_magic?(temp_input.path)

    result = convert_and_upload(temp_input.path, folder)
    temp_input.unlink
    result
  rescue StandardError => e
    Rails.logger.error("Image upload failed: #{e.message}")
    { error: "이미지 업로��에 실���했습니다" }
  end

  def self.valid_image_magic?(path)
    header = File.binread(path, 8)
    MAGIC_BYTES.any? { |magic, _| header.start_with?(magic) }
  end

  def self.upload_base64(base64_string, folder: "images")
    if base64_string.start_with?("data:")
      _header, data = base64_string.split(",", 2)
      ext = base64_string.match(%r{image/(\w+)})&.[](1) || "jpg"
    else
      data = base64_string
      ext = "jpg"
    end

    decoded = Base64.decode64(data)
    return { error: "파일 크기가 10MB를 초과합니다" } if decoded.bytesize > MAX_FILE_SIZE

    temp_input = Tempfile.new([ "upload", ".#{ext}" ])
    temp_input.binmode
    temp_input.write(decoded)
    temp_input.close

    return { error: "이미지 파일이 아닙니다" } unless valid_image_magic?(temp_input.path)

    result = convert_and_upload(temp_input.path, folder)
    temp_input.unlink
    result
  rescue StandardError => e
    Rails.logger.error("Base64 image upload failed: #{e.message}")
    { error: "이미지 업로��에 실���했습니다" }
  end

  def self.ensure_bucket!
    client.head_bucket(bucket: BUCKET)
  rescue Aws::S3::Errors::NotFound, Aws::S3::Errors::NoSuchBucket
    client.create_bucket(bucket: BUCKET)
  rescue StandardError => e
    Rails.logger.warn("Bucket check failed: #{e.message}")
  end

  private

  def self.convert_and_upload(input_path, folder)
    output_path = "/tmp/#{SecureRandom.uuid}.webp"

    # convert 명령어로 리사이즈 + WebP 변환
    safe_input = Shellwords.escape(input_path)
    safe_output = Shellwords.escape(output_path)
    cmd = "convert #{safe_input} -resize #{MAX_LONG_SIDE}x#{MAX_LONG_SIDE}\\> -quality 85 #{safe_output}"
    stdout, stderr, status = Open3.capture3(cmd)

    unless status.success?
      # convert 실패 시 cwebp 시도
      cmd2 = "cwebp -q 85 -resize #{MAX_LONG_SIDE} 0 #{safe_input} -o #{safe_output}"
      stdout2, stderr2, status2 = Open3.capture3(cmd2)

      unless status2.success?
        # 둘 다 실패하면 원본 그대로 업로드
        output_path = input_path
        Rails.logger.warn("Image conversion failed, uploading original: #{stderr} | #{stderr2}")
      end
    end

    # S3 업로드
    key = "#{folder}/#{SecureRandom.uuid}.webp"
    content_type = output_path.end_with?(".webp") ? "image/webp" : "image/jpeg"

    client.put_object(
      bucket: BUCKET,
      key: key,
      body: File.read(output_path),
      content_type: content_type,
      acl: "public-read"
    )

    # 외부 공개 URL 사용 (내부 IP 노출 방지)
    public_base = ENV.fetch("S3_PUBLIC_URL", "#{ENV.fetch('S3_ENDPOINT', 'http://localhost:9000')}/#{BUCKET}")
    url = "#{public_base}/#{key}"

    # 임시 파일 정리
    File.delete(output_path) if output_path != input_path && File.exist?(output_path)

    { url: url, key: key }
  end
end
