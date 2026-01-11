class AuthController < ApplicationController
  skip_before_action :authenticate_user_from_token, if: :skip_authentication?

  def skip_authentication?
    action_name == "login" || action_name == "register" || action_name == "me"
  end

  def login
    user = User.find_by(email: params.expect(:email))

    if user&.authenticate(params.expect(:password))
      token = generate_jwt_token(user)
      render json: {
        user: user.to_json,
        token: token
      }
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  def register
    existing_user = User.find_by(email: params.expect(:email))
    if existing_user
      render json: { error: "User already exists" }, status: :unprocessable_entity
      return
    end

    user = User.new(
      name: params.expect(:name),
      email: params.expect(:email),
      password: params.expect(:password)
    )

    if user.save
      token = generate_jwt_token(user)
      render json: {
        user: user.to_json,
        token: token
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def me
    render json: {
      user: current_user.to_json
    }
  end

  def update_avatar
    avatar_index = params.expect(:avatarIndex).to_i

    if avatar_index < 1 || avatar_index > 35
      render json: { error: "Avatar index must be between 1 and 35" }, status: :unprocessable_entity
      return
    end

    current_user.avatar_url = "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_#{avatar_index}.png"

    if current_user.save
      render json: {
        user: current_user.to_json
      }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
