export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          preferred_locale: string | null;
          referral_code: string | null;
          referred_by: string | null;
          free_readings: number;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          preferred_locale?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          free_readings?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          preferred_locale?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          free_readings?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          stripe_session_id: string;
          stripe_payment_intent: string | null;
          customer_email: string | null;
          user_id: string | null;
          chart_id: string;
          user_name: string;
          tier: string;
          amount: number;
          currency: string;
          status: string;
          reading_data: Json | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          stripe_session_id: string;
          stripe_payment_intent?: string | null;
          customer_email?: string | null;
          user_id?: string | null;
          chart_id?: string;
          user_name?: string;
          tier?: string;
          amount?: number;
          currency?: string;
          status?: string;
          reading_data?: Json | null;
          paid_at?: string | null;
        };
        Update: {
          stripe_session_id?: string;
          stripe_payment_intent?: string | null;
          customer_email?: string | null;
          user_id?: string | null;
          chart_id?: string;
          user_name?: string;
          tier?: string;
          amount?: number;
          currency?: string;
          status?: string;
          reading_data?: Json | null;
          paid_at?: string | null;
        };
      };
      readings_cache: {
        Row: {
          id: string;
          chart_hash: string;
          chart_summary: Json;
          reading: Json;
          tier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chart_hash: string;
          chart_summary: Json;
          reading: Json;
          tier?: string;
        };
        Update: {
          chart_hash?: string;
          chart_summary?: Json;
          reading?: Json;
          tier?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan: string;
          status: string;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          plan?: string;
          status?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: string;
          reward_given: boolean;
          created_at: string;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status?: string;
          reward_given?: boolean;
          converted_at?: string | null;
        };
        Update: {
          status?: string;
          reward_given?: boolean;
          converted_at?: string | null;
        };
      };
      horoscope_cache: {
        Row: {
          id: string;
          sign: string;
          locale: string;
          date: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          sign: string;
          locale: string;
          date: string;
          data: Json;
        };
        Update: {
          sign?: string;
          locale?: string;
          date?: string;
          data?: Json;
        };
      };
      health_assessments: {
        Row: {
          id: string;
          user_id: string;
          answers: Json;
          constitution_type: string;
          constitution_subtype: string;
          secondary_type: string | null;
          five_elements_score: Json;
          nine_constitutions_score: Json;
          bazi_chart_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          answers: Json;
          constitution_type: string;
          constitution_subtype: string;
          secondary_type?: string | null;
          five_elements_score: Json;
          nine_constitutions_score: Json;
          bazi_chart_hash?: string | null;
        };
        Update: {
          answers?: Json;
          constitution_type?: string;
          constitution_subtype?: string;
          secondary_type?: string | null;
          five_elements_score?: Json;
          nine_constitutions_score?: Json;
          bazi_chart_hash?: string | null;
        };
      };
      health_readings_cache: {
        Row: {
          id: string;
          assessment_id: string;
          reading: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          reading: Json;
        };
        Update: {
          reading?: Json;
        };
      };
      health_conversations: {
        Row: {
          id: string;
          assessment_id: string;
          user_id: string;
          messages: Json;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          user_id: string;
          messages?: Json;
          message_count?: number;
        };
        Update: {
          messages?: Json;
          message_count?: number;
          updated_at?: string;
        };
      };
    };
  };
}
