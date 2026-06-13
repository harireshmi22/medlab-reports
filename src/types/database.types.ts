export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          role: 'admin' | 'lab_staff' | 'patient'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          role?: 'admin' | 'lab_staff' | 'patient'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'lab_staff' | 'patient'
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          profile_id: string | null
          name: string
          age: number | null
          gender: string | null
          phone: string | null
          email: string | null
          address: string | null
          blood_group: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          name: string
          age?: number | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          blood_group?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          name?: string
          age?: number | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          blood_group?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          report_no: string
          patient_id: string
          created_by: string | null
          status: 'draft' | 'pending' | 'completed' | 'published'
          notes: string | null
          pdf_url: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_no: string
          patient_id: string
          created_by?: string | null
          status?: 'draft' | 'pending' | 'completed' | 'published'
          notes?: string | null
          pdf_url?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_no?: string
          patient_id?: string
          created_by?: string | null
          status?: 'draft' | 'pending' | 'completed' | 'published'
          notes?: string | null
          pdf_url?: string | null
          published_at?: string | null
          created_at?: string
        }
      }
      report_items: {
        Row: {
          id: string
          report_id: string
          test_name: string
          result_value: string | null
          unit: string | null
          normal_range: string | null
          flag: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          test_name: string
          result_value?: string | null
          unit?: string | null
          normal_range?: string | null
          flag?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          test_name?: string
          result_value?: string | null
          unit?: string | null
          normal_range?: string | null
          flag?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'lab_staff' | 'patient'
      report_status: 'draft' | 'pending' | 'completed' | 'published'
    }
  }
}
