# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_04_03_111056) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_action_logs", force: :cascade do |t|
    t.bigint "admin_user_id", null: false
    t.string "action", null: false
    t.string "target_type"
    t.integer "target_id"
    t.jsonb "details", default: {}
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_user_id"], name: "index_admin_action_logs_on_admin_user_id"
    t.index ["created_at"], name: "index_admin_action_logs_on_created_at"
    t.index ["target_type", "target_id"], name: "index_admin_action_logs_on_target_type_and_target_id"
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "name", null: false
    t.integer "role", default: 1
    t.boolean "active", default: true
    t.datetime "last_login_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
  end

  create_table "announcements", force: :cascade do |t|
    t.bigint "admin_user_id", null: false
    t.string "title", null: false
    t.text "content", null: false
    t.integer "target_audience", default: 0
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_user_id"], name: "index_announcements_on_admin_user_id"
  end

  create_table "blocks", force: :cascade do |t|
    t.bigint "blocker_id", null: false
    t.bigint "blocked_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blocked_id"], name: "index_blocks_on_blocked_id"
    t.index ["blocker_id", "blocked_id"], name: "index_blocks_on_blocker_id_and_blocked_id", unique: true
    t.index ["blocker_id"], name: "index_blocks_on_blocker_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.bigint "match_id", null: false
    t.integer "status"
    t.datetime "last_message_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["match_id"], name: "index_conversations_on_match_id"
  end

  create_table "interests", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "receiver_id", null: false
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["receiver_id"], name: "index_interests_on_receiver_id"
    t.index ["sender_id", "receiver_id"], name: "index_interests_on_sender_id_and_receiver_id", unique: true
    t.index ["sender_id"], name: "index_interests_on_sender_id"
  end

  create_table "invite_codes", force: :cascade do |t|
    t.string "code", null: false
    t.bigint "owner_id", null: false
    t.bigint "used_by_id"
    t.integer "status", default: 0
    t.datetime "used_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["code"], name: "index_invite_codes_on_code", unique: true
    t.index ["owner_id", "status"], name: "index_invite_codes_on_owner_id_and_status"
    t.index ["owner_id"], name: "index_invite_codes_on_owner_id"
    t.index ["used_by_id"], name: "index_invite_codes_on_used_by_id"
  end

  create_table "matches", force: :cascade do |t|
    t.bigint "user1_id", null: false
    t.bigint "user2_id", null: false
    t.integer "status", default: 0
    t.datetime "matched_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user1_id", "user2_id"], name: "index_matches_on_user1_id_and_user2_id", unique: true
    t.index ["user1_id"], name: "index_matches_on_user1_id"
    t.index ["user2_id"], name: "index_matches_on_user2_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "conversation_id", null: false
    t.bigint "sender_id", null: false
    t.text "content"
    t.integer "message_type", default: 0
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["metadata"], name: "index_messages_on_metadata", using: :gin
    t.index ["sender_id"], name: "index_messages_on_sender_id"
  end

  create_table "post_images", force: :cascade do |t|
    t.bigint "post_id", null: false
    t.string "image_url"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_post_images_on_post_id"
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "content"
    t.string "mood_tag"
    t.integer "visibility"
    t.integer "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "pre_registrations", force: :cascade do |t|
    t.string "name", null: false
    t.string "phone", null: false
    t.integer "gender", default: 0
    t.integer "birth_year"
    t.string "region"
    t.string "referral_source"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["phone"], name: "index_pre_registrations_on_phone", unique: true
  end

  create_table "preference_filters", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "preferred_gender"
    t.integer "min_age"
    t.integer "max_age"
    t.text "preferred_regions"
    t.string "preferred_marriage_timing"
    t.string "preferred_religion"
    t.integer "preferred_smoking"
    t.integer "preferred_drinking"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_preference_filters_on_user_id"
  end

  create_table "relationships", force: :cascade do |t|
    t.bigint "initiator_id", null: false
    t.bigint "partner_id", null: false
    t.integer "relationship_type", default: 0
    t.integer "status", default: 0
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["initiator_id"], name: "index_relationships_on_initiator_id"
    t.index ["partner_id"], name: "index_relationships_on_partner_id"
  end

  create_table "reports", force: :cascade do |t|
    t.bigint "reporter_id", null: false
    t.bigint "reported_id", null: false
    t.string "reportable_type", null: false
    t.bigint "reportable_id", null: false
    t.integer "report_type", default: 0
    t.text "reason"
    t.integer "status", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reportable_type", "reportable_id"], name: "index_reports_on_reportable"
    t.index ["reported_id"], name: "index_reports_on_reported_id"
    t.index ["reporter_id"], name: "index_reports_on_reporter_id"
  end

  create_table "sanctions", force: :cascade do |t|
    t.bigint "admin_user_id", null: false
    t.bigint "user_id", null: false
    t.integer "sanction_type", default: 0
    t.text "reason", null: false
    t.datetime "starts_at"
    t.datetime "ends_at"
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_user_id"], name: "index_sanctions_on_admin_user_id"
    t.index ["user_id", "active"], name: "index_sanctions_on_user_id_and_active"
    t.index ["user_id"], name: "index_sanctions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "phone", null: false
    t.boolean "phone_verified", default: false
    t.string "password_digest"
    t.string "nickname"
    t.integer "gender", default: 0
    t.integer "birth_year"
    t.string "region"
    t.string "occupation"
    t.string "desired_marriage_timing"
    t.string "education"
    t.integer "height"
    t.integer "smoking", default: 0
    t.integer "drinking", default: 0
    t.boolean "selfie_verified", default: false
    t.boolean "profile_completed", default: false
    t.integer "status", default: 0
    t.integer "verification_level", default: 0
    t.text "bio"
    t.string "profile_image_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "invited_by_code"
    t.boolean "paid", default: false
    t.boolean "is_seed_user", default: false
    t.string "kakao_id"
    t.string "kakao_nickname"
    t.string "kakao_profile_image"
    t.string "kakao_email"
    t.string "work_email"
    t.boolean "work_email_verified", default: false
    t.datetime "work_email_verified_at"
    t.string "work_email_domain"
    t.string "email_verification_token"
    t.index ["gender"], name: "index_users_on_gender"
    t.index ["kakao_id"], name: "index_users_on_kakao_id", unique: true
    t.index ["nickname"], name: "index_users_on_nickname", unique: true
    t.index ["phone"], name: "index_users_on_phone", unique: true
    t.index ["region"], name: "index_users_on_region"
    t.index ["status"], name: "index_users_on_status"
  end

  create_table "value_surveys", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.integer "marriage_intention"
    t.integer "children_plan"
    t.string "religion"
    t.integer "lifestyle_pattern"
    t.integer "spending_tendency"
    t.integer "relationship_style"
    t.integer "conflict_resolution"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_value_surveys_on_user_id"
  end

  add_foreign_key "admin_action_logs", "admin_users"
  add_foreign_key "announcements", "admin_users"
  add_foreign_key "blocks", "users", column: "blocked_id"
  add_foreign_key "blocks", "users", column: "blocker_id"
  add_foreign_key "conversations", "matches"
  add_foreign_key "interests", "users", column: "receiver_id"
  add_foreign_key "interests", "users", column: "sender_id"
  add_foreign_key "invite_codes", "users", column: "owner_id"
  add_foreign_key "invite_codes", "users", column: "used_by_id"
  add_foreign_key "matches", "users", column: "user1_id"
  add_foreign_key "matches", "users", column: "user2_id"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "post_images", "posts"
  add_foreign_key "posts", "users"
  add_foreign_key "preference_filters", "users"
  add_foreign_key "relationships", "users", column: "initiator_id"
  add_foreign_key "relationships", "users", column: "partner_id"
  add_foreign_key "reports", "users", column: "reported_id"
  add_foreign_key "reports", "users", column: "reporter_id"
  add_foreign_key "sanctions", "admin_users"
  add_foreign_key "sanctions", "users"
  add_foreign_key "value_surveys", "users"
end
