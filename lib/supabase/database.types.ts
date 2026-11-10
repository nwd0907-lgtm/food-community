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
      payment: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          payment_snapshot_id: string;
          product_id: string;
          transaction_key: string;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          payment_snapshot_id: string;
          product_id: string;
          transaction_key: string;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          payment_snapshot_id?: string;
          product_id?: string;
          transaction_key?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_payment_snapshot_id_fkey";
            columns: ["payment_snapshot_id"];
            isOneToOne: false;
            referencedRelation: "payment_snaphost";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "product";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_snaphost: {
        Row: {
          created_at: string;
          id: string;
          snapshot_payment: Json;
          snapshot_product: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          snapshot_payment: Json;
          snapshot_product: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          snapshot_payment?: Json;
          snapshot_product?: Json;
        };
        Relationships: [];
      };
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
      product: {
        Row: {
          address: string;
          capacity: number;
          created_at: string;
          description: string;
          event_at: string;
          id: string;
          image_path_detail: string;
          image_path_main: string;
          name: string;
          price: number;
          status: string;
        };
        Insert: {
          address: string;
          capacity: number;
          created_at?: string;
          description: string;
          event_at: string;
          id?: string;
          image_path_detail: string;
          image_path_main: string;
          name: string;
          price: number;
          status: string;
        };
        Update: {
          address?: string;
          capacity?: number;
          created_at?: string;
          description?: string;
          event_at?: string;
          id?: string;
          image_path_detail?: string;
          image_path_main?: string;
          name?: string;
          price?: number;
          status?: string;
        };
        Relationships: [];
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
      product_participant_counts: {
        Args: { p_product_ids: string[] };
        Returns: { participants: number; product_id: string }[];
      };
      record_payment: {
        Args: {
          p_amount: number;
          p_product_id: string;
          p_snapshot_payment: Json;
          p_snapshot_product: Json;
          p_transaction_key: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: Database["public"]["Tables"]["payment"]["Row"];
      };
      soft_delete_place: { Args: { p_place_id: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
