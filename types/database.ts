export type Database = {
  public: {
    Tables: {
      shared_maps: {
        Row: {
          id: string
          user_id: string
          share_code: string
          image_url: string
          title: string
          description: string | null
          is_active: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          share_code: string
          image_url: string
          title?: string
          description?: string | null
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          share_code?: string
          image_url?: string
          title?: string
          description?: string | null
          is_active?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_maps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
        Relationships: []
      }
      regions: {
        Row: {
          id: string
          country_id: string
          name: string
          name_local: string | null
          region_code: string | null
          created_at: string
        }
        Insert: {
          id: string
          country_id: string
          name: string
          name_local?: string | null
          region_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          country_id?: string
          name?: string
          name_local?: string | null
          region_code?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regions_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
      visits: {
        Row: {
          id: string
          user_id: string
          region_id: string
          country_id: string
          rating: number
          star_rating: number | null
          visit_year: number
          initial_visit_year: number | null
          most_recent_visit_year: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          region_id: string
          country_id: string
          rating: number
          star_rating?: number | null
          visit_year: number
          initial_visit_year?: number | null
          most_recent_visit_year?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          region_id?: string
          country_id?: string
          rating?: number
          star_rating?: number | null
          visit_year?: number
          initial_visit_year?: number | null
          most_recent_visit_year?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
      prefecture_ratings: {
        Row: {
          id: string
          user_id: string
          region_id: string
          country_id: string
          star_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          region_id: string
          country_id: string
          star_rating: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          region_id?: string
          country_id?: string
          star_rating?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prefecture_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prefecture_ratings_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prefecture_ratings_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_share_view_count: {
        Args: {
          share_code_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
