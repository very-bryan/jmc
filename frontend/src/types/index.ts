export interface User {
  id: number;
  phone: string;
  nickname: string;
  gender: string;
  birth_year: number;
  age: number;
  region: string;
  occupation: string;
  desired_marriage_timing: string;
  education: string;
  height: number;
  smoking: string;
  drinking: string;
  bio: string;
  profile_image_url: string | null;
  phone_verified: boolean;
  selfie_verified: boolean;
  profile_completed: boolean;
  status: string;
  verification_level: string;
  mbti: string | null;
  show_mbti: boolean;
  created_at: string;
}

export interface ValueSurvey {
  id: number;
  marriage_intention: string;
  children_plan: string;
  religion: string;
  lifestyle_pattern: string;
  spending_tendency: string;
  relationship_style: string;
  conflict_resolution: string;
}

export interface PreferenceFilter {
  id: number;
  preferred_gender: string;
  min_age: number;
  max_age: number;
  preferred_regions: string[];
  preferred_marriage_timing: string;
  preferred_religion: string;
  preferred_smoking: string;
  preferred_drinking: string;
}

export interface Post {
  id: number;
  content: string;
  mood_tag: string;
  visibility: string;
  images: { url: string; position: number }[];
  user: PostUser;
  created_at: string;
}

export interface PostUser {
  id: number;
  nickname: string;
  age: number;
  region: string;
  profile_image_url: string | null;
  verification_level: string;
}

export interface Interest {
  id: number;
  status: string;
  user: PostUser;
  created_at: string;
}

export interface Conversation {
  id: number;
  status: string;
  last_message_at: string;
  last_message: {
    content: string;
    sender_id: number;
    created_at: string;
    read: boolean;
  } | null;
  user: PostUser;
}

export interface Message {
  id: number;
  content: string;
  message_type: string;
  sender_id: number;
  is_mine: boolean;
  read: boolean;
  created_at: string;
}
