class User < ApplicationRecord
  has_secure_password

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true

  before_validation :set_default_avatar, if: -> { avatar_url.blank? }

  AVATAR_BASE_URL = "https://cdn.jsdelivr.net/gh/alohe/avatars/png"

  def avatar_url
    return self[:avatar_url] if self[:avatar_url].present?
    "#{AVATAR_BASE_URL}/memo_#{avatar_index}.png"
  end

  def to_json
    {
      id: id,
      email: email,
      name: name,
      avatarUrl: avatar_url
    }
  end

  private

  def set_default_avatar
    self.avatar_url = nil
  end

  def avatar_index
    @avatar_index ||= ((email.to_s.sum) % 35) + 1
  end
end
