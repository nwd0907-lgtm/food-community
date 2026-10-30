// Supabase MCP generate_typescript_types 결과 (스키마 변경 시 재생성)
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      place: {
        Row: {
          address: string | null;
          content: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          latitude: number | null;
          longitude: number | null;
          title: string;
          user_id: string;
        };
        Insert: {
          address?: string | null;
          content: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          title: string;
          user_id?: string;
        };
        Update: {
          address?: string | null;
          content?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          latitude?: number | null;
          longitude?: number | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      place_image: {
        Row: {
          created_at: string;
          id: string;
          image_path: string;
          place_id: string;
          position: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path: string;
          place_id: string;
          position?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string;
          place_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "place_image_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "place";
            referencedColumns: ["id"];
          },
        ];
      };
      profile: {
        Row: {
          created_at: string;
          id: string;
          image_path: string | null;
          nickname: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          image_path?: string | null;
          nickname?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          image_path?: string | null;
          nickname?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      soft_delete_place: { Args: { p_place_id: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
