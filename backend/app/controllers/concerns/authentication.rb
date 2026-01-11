module Authentication
  extend ActiveSupport::Concern

  SECRET_KEY = Rails.application.credentials.secret_key_base || Rails.secret_key_base

  included do
    before_action :authenticate_user_from_token, if: :authenticated_route?
  end

  def generate_jwt_token(user)
    JWT.encode(
      {
        user_id: user.id,
        email: user.email,
        exp: 24.hours.from_now.to_i
      },
      SECRET_KEY,
      "HS256"
    )
  end

  def current_user
    @current_user ||= authenticate_user_from_token
  end

  def authenticate_user
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_user
  end

  private

  def authenticate_user_from_token
    token = extract_token_from_header
    return nil unless token

    begin
      decoded = JWT.decode(token, SECRET_KEY, algorithm: "HS256").first
      User.find_by(id: decoded["user_id"])
    rescue JWT::ExpiredSignature, JWT::DecodeError
      nil
    end
  end

  def extract_token_from_header
    auth_header = request.headers["Authorization"]
    return nil unless auth_header&.start_with?("Bearer ")

    auth_header.sub("Bearer ", "")
  end

  def authenticated_route?
    !skip_authentication?
  end

  def skip_authentication?
    false
  end
end
