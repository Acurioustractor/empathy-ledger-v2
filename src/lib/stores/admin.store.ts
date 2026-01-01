import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface FilterState {
  search: string
  status: 'all' | 'active' | 'pending' | 'suspended' | 'inactive'
  featured: 'all' | 'true' | 'false'
  elder: 'all' | 'true' | 'false'
  organisation: string | null
  location: string | null
  project: string | null
  sortBy: 'name' | 'stories' | 'recent' | 'engagement'
  sortOrder: 'asc' | 'desc'
}

interface AdminStore {
  // Selected items for bulk actions
  selectedStorytellers: string[]
  selectedStories: string[]
  
  // Filters
  storytellerFilters: FilterState
  storyFilters: Partial<FilterState>
  
  // View preferences
  viewMode: 'grid' | 'list' | 'table'
  sidebarCollapsed: boolean
  
  // Actions
  setSelectedStorytellers: (ids: string[]) => void
  toggleStoryteller: (id: string) => void
  clearSelectedStorytellers: () => void
  
  setSelectedStories: (ids: string[]) => void
  toggleStory: (id: string) => void
  clearSelectedStories: () => void
  
  updateStorytellerFilters: (filters: Partial<FilterState>) => void
  resetStorytellerFilters: () => void
  
  updateStoryFilters: (filters: Partial<FilterState>) => void
  resetStoryFilters: () => void
  
  setViewMode: (mode: 'grid' | 'list' | 'table') => void
  toggleSidebar: () => void
}

const defaultFilters: FilterState = {
  search: '',
  status: 'all',
  featured: 'all',
  elder: 'all',
  organisation: null,
  location: null,
  project: null,
  sortBy: 'name',
  sortOrder: 'asc'
}

export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedStorytellers: [],
        selectedStories: [],
        storytellerFilters: defaultFilters,
        storyFilters: {},
        viewMode: 'table',
        sidebarCollapsed: false,
        
        // Storyteller selection actions
        setSelectedStorytellers: (ids) => set({ selectedStorytellers: ids }),
        toggleStoryteller: (id) => set((state) => ({
          selectedStorytellers: state.selectedStorytellers.includes(id)
            ? state.selectedStorytellers.filter(i => i !== id)
            : [...state.selectedStorytellers, id]
        })),
        clearSelectedStorytellers: () => set({ selectedStorytellers: [] }),
        
        // Story selection actions
        setSelectedStories: (ids) => set({ selectedStories: ids }),
        toggleStory: (id) => set((state) => ({
          selectedStories: state.selectedStories.includes(id)
            ? state.selectedStories.filter(i => i !== id)
            : [...state.selectedStories, id]
        })),
        clearSelectedStories: () => set({ selectedStories: [] }),
        
        // Filter actions
        updateStorytellerFilters: (filters) => set((state) => ({
          storytellerFilters: { ...state.storytellerFilters, ...filters }
        })),
        resetStorytellerFilters: () => set({ storytellerFilters: defaultFilters }),
        
        updateStoryFilters: (filters) => set((state) => ({
          storyFilters: { ...state.storyFilters, ...filters }
        })),
        resetStoryFilters: () => set({ storyFilters: {} }),
        
        // View actions
        setViewMode: (mode) => set({ viewMode: mode }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      }),
      {
        name: 'admin-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          sidebarCollapsed: state.sidebarCollapsed,
          storytellerFilters: state.storytellerFilters,
          storyFilters: state.storyFilters
        })
      }
    )
  )
)