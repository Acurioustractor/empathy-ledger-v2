'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Search,
  Home,
  Users,
  BookOpen,
  Building2,
  FolderOpen,
  Settings,
  Plus,
  FileText,
  BarChart,
  LogOut,
  User,
  Heart,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/context/auth.context'
import { Badge } from '@/components/ui/badge'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [pages, setPages] = useState<string[]>(['home'])
  const [storytellers, setStorytellers] = useState<any[]>([])
  const router = useRouter()
  const { isLoading: isAuthLoading, isAuthenticated, isAdmin } = useAuth()

  // Use controlled state if provided
  const isOpen = controlledOpen !== undefined ? controlledOpen : open
  const handleOpenChange = onOpenChange || setOpen

  // Fetch storytellers only when auth is ready and user is admin
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isAdmin) {
      fetch('/api/admin/storytellers?limit=5')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.storytellers) {
            setStorytellers(data.storytellers)
          }
        })
        .catch(() => {
          // Silently fail - not critical for command palette
        })
    }
  }, [isAuthLoading, isAuthenticated, isAdmin])
  
  const currentPage = pages[pages.length - 1]

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleOpenChange(!isOpen)
      }
    }
    
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isOpen])

  const navigate = (path: string) => {
    router.push(path)
    handleOpenChange(false)
    setPages(['home'])
    setSearch('')
  }

  const runCommand = (command: () => void) => {
    handleOpenChange(false)
    command()
    setPages(['home'])
    setSearch('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          {/* Command List */}
          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            {currentPage === 'home' && (
              <>
                {/* Quick Actions */}
                <Command.Group heading="Quick Actions">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/stories/create-modern'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Story</span>
                    <Badge variant="secondary" className="ml-auto">New</Badge>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/admin/modern/storytellers'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>Manage Storytellers</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => setPages([...pages, 'stories'])}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Search Stories</span>
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Command.Item>
                </Command.Group>

                {/* Navigation */}
                <Command.Group heading="Navigation">
                  <Command.Item
                    onSelect={() => navigate('/admin/modern')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => navigate('/storytellers')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="h-4 w-4" />
                    <span>Storytellers</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => navigate('/stories')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Stories</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => navigate('/organisations')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Organizations</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => navigate('/projects')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span>Projects</span>
                  </Command.Item>
                </Command.Group>

                {/* Recent Storytellers (admin only) */}
                {isAdmin && storytellers.length > 0 && (
                  <Command.Group heading="Recent Storytellers">
                    {storytellers.slice(0, 3).map((storyteller: any) => (
                      <Command.Item
                        key={storyteller.id}
                        onSelect={() => navigate(`/storytellers/${storyteller.id}`)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>{storyteller.display_name || storyteller.displayName}</span>
                        <Badge variant="outline" className="ml-auto">
                          {storyteller.story_count || storyteller.storyCount || 0} stories
                        </Badge>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Settings */}
                <Command.Group heading="Settings">
                  <Command.Item
                    onSelect={() => navigate('/profile')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => navigate('/settings')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => runCommand(() => console.log('Sign out'))}
                    className="flex items-center gap-2 cursor-pointer text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}

            {currentPage === 'stories' && (
              <>
                <Command.Group heading="Story Actions">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/stories/create-modern'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Story</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => runCommand(() => console.log('View drafts'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                    <span>View Drafts</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => runCommand(() => console.log('Published stories'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Published Stories</span>
                  </Command.Item>
                  
                  <Command.Item
                    onSelect={() => runCommand(() => console.log('Story analytics'))}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Story Analytics</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center border-t px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                ↵
              </kbd>
              <span>Select</span>
            </div>
            {pages.length > 1 && (
              <button
                onClick={() => setPages(pages.slice(0, -1))}
                className="ml-auto text-xs hover:text-foreground"
              >
                ← Back
              </button>
            )}
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}