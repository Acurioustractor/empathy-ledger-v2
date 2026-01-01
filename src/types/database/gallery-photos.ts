import { Json } from './base'

export interface GalleryPhotoTables {
  galleries: {
    Row: {
      cover_image: string | null
      cover_image_id: string | null
      created_at: string
      created_by: string
      cultural_context: Json | null
      cultural_sensitivity_level: string | null
      cultural_significance: string | null
      cultural_theme: string | null
      description: string | null
      featured: boolean | null
      id: string
      is_public: boolean | null
      organization_id: string | null
      photo_count: number | null
      slug: string
      status: string | null
      title: string
      updated_at: string
      view_count: number | null
      visibility: string | null
    }
    Insert: {
      cover_image?: string | null
      cover_image_id?: string | null
      created_at?: string
      created_by: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_significance?: string | null
      cultural_theme?: string | null
      description?: string | null
      featured?: boolean | null
      id?: string
      is_public?: boolean | null
      organization_id?: string | null
      photo_count?: number | null
      slug: string
      status?: string | null
      title: string
      updated_at?: string
      view_count?: number | null
      visibility?: string | null
    }
    Update: {
      cover_image?: string | null
      cover_image_id?: string | null
      created_at?: string
      created_by?: string
      cultural_context?: Json | null
      cultural_sensitivity_level?: string | null
      cultural_significance?: string | null
      cultural_theme?: string | null
      description?: string | null
      featured?: boolean | null
      id?: string
      is_public?: boolean | null
      organization_id?: string | null
      photo_count?: number | null
      slug?: string
      status?: string | null
      title?: string
      updated_at?: string
      view_count?: number | null
      visibility?: string | null
    }
    Relationships: []
  }
  gallery_media_associations: {
    Row: {
      caption: string | null
      created_at: string
      cultural_context: string | null
      gallery_id: string
      id: string
      is_cover_image: boolean | null
      media_asset_id: string
      sort_order: number | null
    }
    Insert: {
      caption?: string | null
      created_at?: string
      cultural_context?: string | null
      gallery_id: string
      id?: string
      is_cover_image?: boolean | null
      media_asset_id: string
      sort_order?: number | null
    }
    Update: {
      caption?: string | null
      created_at?: string
      cultural_context?: string | null
      gallery_id?: string
      id?: string
      is_cover_image?: boolean | null
      media_asset_id?: string
      sort_order?: number | null
    }
    Relationships: []
  }
  gallery_photos: {
    Row: {
      caption: string | null
      created_at: string | null
      gallery_id: string
      id: string
      order_index: number | null
      photo_url: string
      photographer: string | null
      uploaded_by: string | null
    }
    Insert: {
      caption?: string | null
      created_at?: string | null
      gallery_id: string
      id?: string
      order_index?: number | null
      photo_url: string
      photographer?: string | null
      uploaded_by?: string | null
    }
    Update: {
      caption?: string | null
      created_at?: string | null
      gallery_id?: string
      id?: string
      order_index?: number | null
      photo_url?: string
      photographer?: string | null
      uploaded_by?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "gallery_photos_gallery_id_fkey"
        columns: ["gallery_id"]
        isOneToOne: false
        referencedRelation: "galleries"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "gallery_photos_uploaded_by_fkey"
        columns: ["uploaded_by"]
        isOneToOne: false
        referencedRelation: "profiles"
        referencedColumns: ["id"]
      },
    ]
  }
  photo_gallery_items: {
    Row: {
      alt_text: string | null
      caption: string | null
      created_at: string | null
      cultural_context: string | null
      gallery_id: string
      id: string
      is_cover_image: boolean | null
      photographer: string | null
      sort_order: number | null
      url: string
    }
    Insert: {
      alt_text?: string | null
      caption?: string | null
      created_at?: string | null
      cultural_context?: string | null
      gallery_id: string
      id?: string
      is_cover_image?: boolean | null
      photographer?: string | null
      sort_order?: number | null
      url: string
    }
    Update: {
      alt_text?: string | null
      caption?: string | null
      created_at?: string | null
      cultural_context?: string | null
      gallery_id?: string
      id?: string
      is_cover_image?: boolean | null
      photographer?: string | null
      sort_order?: number | null
      url?: string
    }
    Relationships: [
      {
        foreignKeyName: "photo_gallery_items_gallery_id_fkey"
        columns: ["gallery_id"]
        isOneToOne: false
        referencedRelation: "galleries"
        referencedColumns: ["id"]
      },
    ]
  }
}