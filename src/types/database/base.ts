export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DatabaseConfig = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
}