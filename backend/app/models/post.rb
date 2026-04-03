class Post < ApplicationRecord
  belongs_to :user
  has_many :post_images, dependent: :destroy
  accepts_nested_attributes_for :post_images, allow_destroy: true

  enum :visibility, { public_post: 0, followers_only: 1, private_post: 2 }
  enum :status, { draft: 0, published: 1, hidden: 2, removed: 3 }, prefix: :post

  validates :content, presence: true, length: { maximum: 1000 }

  scope :visible_posts, -> { where(status: :published) }
  scope :recent, -> { order(created_at: :desc) }
end
