export type User = {
  id: number;
  email: string;
  name: string;
  age: number | null;
  gender: string | null;
  preference: string | null;
  bio: string | null;
  avatar_url?: string | null;
  default_questions?: string[];
  private_profile_completed?: boolean;
  private_email?: string | null;
  private_phone?: string | null;
  private_location?: string | null;
  private_notes?: string | null;
  is_premium?: boolean;
  premium_until?: string | null;
  connect_contacts_enabled?: boolean;
  preferred_language?: string | null;
  community_label?: string | null;
};

export type DimensionScores = Record<string, number | null>;

export type Match = {
  id: number;
  name: string;
  age: number | null;
  gender: string | null;
  preference: string | null;
  bio: string | null;
  avatar_url?: string | null;
  default_questions?: string[];
  preferred_language?: string | null;
  community_label?: string | null;
  compatibility: number;
  scores: Record<string, number | null>;
};

export type PremiumStatus = {
  isPremium: boolean;
  premiumUntil: string | null;
};

export type PremiumEvent = {
  id: number;
  event_type: string;
  amount_usd: number | null;
  created_at: string;
};

export type DimensionInterpretation = {
  dimension: string;
  name: string;
  status?: 'insufficient_data';
  message?: string;
  score?: number;
  band?: 'high' | 'mid' | 'low';
  headline?: string;
  researchMap?: string;
  keywords?: string[];
  growthActions?: string[];
  universalActions?: string[];
  microcopy?: string;
  caveat?: string;
};

export type InterpretationsPayload = {
  guardrails: string[];
  interpretationPolicy: string;
  dimensions: DimensionInterpretation[];
};

export type ChatMessage = {
  id: number;
  text: string;
  image_url?: string | null;
  created_at: string;
  sender_id: number;
  sender_name: string;
};

export type ChatRoom = {
  roomId: string;
  match: Match;
  lastMessage: ChatMessage;
};
