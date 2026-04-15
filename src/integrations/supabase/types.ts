export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_records: {
        Row: {
          catatan: string | null
          catatan_guru: string | null
          created_at: string
          guru_id: string
          hafalan_ayat: string | null
          hafalan_jenis_setoran: string | null
          hafalan_juz: number | null
          hafalan_kesalahan_kelancaran: number | null
          hafalan_kesalahan_tajwid: number | null
          hafalan_predikat: string | null
          hafalan_surah: string | null
          id: string
          jilid_buku: string | null
          jilid_halaman: number | null
          jilid_predikat: string | null
          siswa_id: string
          status: string | null
          tahfidz_ayat: string | null
          tahfidz_juz: number | null
          tahfidz_surah: string | null
          tanggal: string
          tilawah_ayat: string | null
          tilawah_kesalahan_kelancaran: number | null
          tilawah_kesalahan_tajwid: number | null
          tilawah_predikat: string | null
          tilawah_surah: string | null
          tilpi_halaman: number | null
          tilpi_kategori: string | null
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          catatan_guru?: string | null
          created_at?: string
          guru_id: string
          hafalan_ayat?: string | null
          hafalan_jenis_setoran?: string | null
          hafalan_juz?: number | null
          hafalan_kesalahan_kelancaran?: number | null
          hafalan_kesalahan_tajwid?: number | null
          hafalan_predikat?: string | null
          hafalan_surah?: string | null
          id?: string
          jilid_buku?: string | null
          jilid_halaman?: number | null
          jilid_predikat?: string | null
          siswa_id: string
          status?: string | null
          tahfidz_ayat?: string | null
          tahfidz_juz?: number | null
          tahfidz_surah?: string | null
          tanggal: string
          tilawah_ayat?: string | null
          tilawah_kesalahan_kelancaran?: number | null
          tilawah_kesalahan_tajwid?: number | null
          tilawah_predikat?: string | null
          tilawah_surah?: string | null
          tilpi_halaman?: number | null
          tilpi_kategori?: string | null
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          catatan_guru?: string | null
          created_at?: string
          guru_id?: string
          hafalan_ayat?: string | null
          hafalan_jenis_setoran?: string | null
          hafalan_juz?: number | null
          hafalan_kesalahan_kelancaran?: number | null
          hafalan_kesalahan_tajwid?: number | null
          hafalan_predikat?: string | null
          hafalan_surah?: string | null
          id?: string
          jilid_buku?: string | null
          jilid_halaman?: number | null
          jilid_predikat?: string | null
          siswa_id?: string
          status?: string | null
          tahfidz_ayat?: string | null
          tahfidz_juz?: number | null
          tahfidz_surah?: string | null
          tanggal?: string
          tilawah_ayat?: string | null
          tilawah_kesalahan_kelancaran?: number | null
          tilawah_kesalahan_tajwid?: number | null
          tilawah_predikat?: string | null
          tilawah_surah?: string | null
          tilpi_halaman?: number | null
          tilpi_kategori?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_records_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_records_siswa_id_fkey"
            columns: ["siswa_id"]
            isOneToOne: false
            referencedRelation: "siswa"
            referencedColumns: ["id"]
          },
        ]
      }
      guru: {
        Row: {
          created_at: string
          email: string
          id: string
          nama: string
          no_hp: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nama: string
          no_hp?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nama?: string
          no_hp?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kelas: {
        Row: {
          created_at: string
          guru_id: string
          id: string
          nama_kelas: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guru_id: string
          id?: string
          nama_kelas: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guru_id?: string
          id?: string
          nama_kelas?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kelas_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "guru"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      siswa: {
        Row: {
          created_at: string
          id: string
          kelas: string
          kelas_id: string | null
          nama: string
          no_hp_ortu: string | null
          photo_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kelas: string
          kelas_id?: string | null
          nama: string
          no_hp_ortu?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kelas?: string
          kelas_id?: string | null
          nama?: string
          no_hp_ortu?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "siswa_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "kelas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "guru" | "siswa" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["guru", "siswa", "admin"],
    },
  },
} as const
