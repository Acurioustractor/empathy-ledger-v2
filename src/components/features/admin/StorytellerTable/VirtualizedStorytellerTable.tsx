'use client'

import React, { useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { useStorytellers, useStorytellerActions } from '@/lib/hooks/useStorytellers'
import { useAdminStore } from '@/lib/stores/admin.store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface Storyteller {
  id: string
  displayName: string
  email: string
  bio: string
  culturalBackground: string
  location: string
  organisation: string
  projects: string[]
  storyCount: number
  engagementRate: number
  isElder: boolean
  isFeatured: boolean
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  createdAt: string
  lastActive: string
  profileImageUrl?: string
}

const columnHelper = createColumnHelper<Storyteller>()

export default function VirtualizedStorytellerTable() {
  const parentRef = React.useRef<HTMLDivElement>(null)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  
  const { 
    selectedStorytellers, 
    toggleStoryteller, 
    clearSelectedStorytellers,
    storytellerFilters 
  } = useAdminStore()
  
  const { storytellers, isLoading, mutate } = useStorytellers({ 
    filters: storytellerFilters,
    limit: 1000 // Load more for virtualization
  })
  
  const { updateStoryteller, deleteStoryteller } = useStorytellerActions()

  // Handle actions with optimistic updates
  const handleStatusChange = useCallback(async (id: string, status: string) => {
    try {
      // Optimistic update
      mutate((data: any) => ({
        ...data,
        storytellers: data.storytellers.map((s: Storyteller) =>
          s.id === id ? { ...s, status } : s
        )
      }), false)
      
      await updateStoryteller(id, { status })
      toast.success('Status updated successfully')
      mutate() // Revalidate
    } catch (error) {
      toast.error('Failed to update status')
      mutate() // Revert on error
    }
  }, [updateStoryteller, mutate])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this storyteller?')) return
    
    try {
      // Optimistic update
      mutate((data: any) => ({
        ...data,
        storytellers: data.storytellers.filter((s: Storyteller) => s.id !== id)
      }), false)
      
      await deleteStoryteller(id)
      toast.success('Storyteller deleted successfully')
    } catch (error) {
      toast.error('Failed to delete storyteller')
      mutate() // Revert on error
    }
  }, [deleteStoryteller, mutate])

  // Define columns
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedStorytellers.includes(row.original.id)}
          onCheckedChange={() => toggleStoryteller(row.original.id)}
          aria-label="Select row"
        />
      ),
    }),
    
    columnHelper.accessor('displayName', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-3"
        >
          Storyteller
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.original.profileImageUrl} />
            <AvatarFallback>{row.original.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.displayName}</div>
            <div className="text-sm text-grey-500">{row.original.email}</div>
          </div>
        </div>
      ),
      size: 300,
    }),
    
    columnHelper.accessor('culturalBackground', {
      header: 'Cultural Background',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.culturalBackground || 'Not specified'}
        </div>
      ),
      size: 200,
    }),
    
    columnHelper.accessor('location', {
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.location || 'Not specified'}
        </div>
      ),
      size: 150,
    }),
    
    columnHelper.accessor('organisation', {
      header: 'Organization',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.organisation || 'Independent'}
        </div>
      ),
      size: 200,
    }),
    
    columnHelper.accessor('storyCount', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-3"
        >
          Stories
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant={row.original.storyCount > 0 ? 'default' : 'secondary'}>
            {row.original.storyCount}
          </Badge>
        </div>
      ),
      size: 100,
    }),
    
    columnHelper.accessor('engagementRate', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-3"
        >
          Engagement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.engagementRate}%</div>
          <div className="w-full bg-grey-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${row.original.engagementRate}%` }}
            />
          </div>
        </div>
      ),
      size: 120,
    }),
    
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = {
          active: 'success',
          pending: 'warning',
          suspended: 'destructive',
          inactive: 'secondary'
        }[status] as any
        
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        )
      },
      size: 100,
    }),
    
    columnHelper.display({
      id: 'actions',
      size: 80,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original.id, 'active')}
              disabled={row.original.status === 'active'}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original.id, 'suspended')}
              disabled={row.original.status === 'suspended'}
            >
              <UserX className="mr-2 h-4 w-4" />
              Suspend
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ], [selectedStorytellers, toggleStoryteller, handleStatusChange, handleDelete])

  // React Table instance
  const table = useReactTable({
    data: storytellers,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  // Virtualizer for performance
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 10,
  })

  const virtualRows = virtualizer.getVirtualItems()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-grey-400" />
          <p className="text-sm text-grey-500">Loading storytellers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Bulk Actions Bar */}
      {selectedStorytellers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedStorytellers.length} storyteller(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {}}>
              <Mail className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="sm" variant="outline" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => {
                if (confirm(`Delete ${selectedStorytellers.length} storytellers?`)) {
                  // Handle bulk delete
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={clearSelectedStorytellers}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border rounded-lg bg-white">
        {/* Table Header */}
        <div className="border-b bg-grey-50">
          <div className="flex">
            {table.getHeaderGroups().map(headerGroup => (
              <React.Fragment key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <div
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Virtualized Table Body */}
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index]
              return (
                <div
                  key={row.id}
                  className={cn(
                    'absolute top-0 left-0 w-full flex border-b hover:bg-grey-50',
                    selectedStorytellers.includes(row.original.id) && 'bg-blue-50'
                  )}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <div
                      key={cell.id}
                      className="px-4 py-3 flex items-center"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-sm text-grey-600">
        <div>
          Showing {virtualRows.length} of {rows.length} storytellers
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  )
}