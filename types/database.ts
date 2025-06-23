export type Database = {
  public: {
    Tables: {
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
      }
      visits: {
        Row: {
          id: string
          user_id: string
          region_id: string
          country_id: string
          rating: number
          star_rating: number | null
          visit_year: number // Now required - each visit is for a specific year
          initial_visit_year: number | null // Legacy field
          most_recent_visit_year: number | null // Legacy field
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
          visit_year: number // Required for new visits
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
      }
    }
  }
}