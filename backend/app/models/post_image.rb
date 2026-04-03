class PostImage < ApplicationRecord
  belongs_to :post

  validates :image_url, presence: true
  validates :position, numericality: { greater_than_or_equal_to: 0, less_than: 4 }
end
