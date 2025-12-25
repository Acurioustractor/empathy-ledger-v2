'use client'

import { useState, useMemo } from 'react'
import { Search, Database, Table2, Columns, Key, Shield, Filter, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'

/**
 * Database Explorer Client Component
 *
 * Interactive database documentation with:
 * - Searchable table list
 * - Category filtering
 * - Column details
 * - Relationship visualization
 * - RLS policy viewing
 */

interface TableInfo {
  table_name: string
  column_count: number
  has_rls: boolean
  category?: string
  description?: string
}

interface DatabaseExplorerClientProps {
  initialTables: TableInfo[]
}

export function DatabaseExplorerClient({ initialTables }: DatabaseExplorerClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedTable, setExpandedTable] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Categorize tables
  const categorizedTables = useMemo(() => {
    const categories: Record<string, TableInfo[]> = {
      'User & Profile': [],
      'Organizations & Tenants': [],
      'Projects & Stories': [],
      'Media & Assets': [],
      'AI & Analysis': [],
      'Impact Analysis': [],
      'Cultural Safety': [],
      'Community': [],
      'System': [],
      'Partner Portal': [],
      'Themes': [],
      'Search': [],
      'Other': []
    }

    initialTables.forEach(table => {
      const name = table.table_name.toLowerCase()

      // Categorization logic
      if (name.includes('profile') || name.includes('user')) {
        categories['User & Profile'].push(table)
      } else if (name.includes('organization') || name.includes('tenant')) {
        categories['Organizations & Tenants'].push(table)
      } else if (name.includes('project') || name.includes('story') || name.includes('transcript')) {
        categories['Projects & Stories'].push(table)
      } else if (name.includes('media') || name.includes('asset') || name.includes('upload') || name.includes('gallery')) {
        categories['Media & Assets'].push(table)
      } else if (name.includes('ai_') || name.includes('analysis') || name.includes('theme_')) {
        categories['AI & Analysis'].push(table)
      } else if (name.includes('sroi') || name.includes('ripple') || name.includes('impact') || name.includes('narrative_arc')) {
        categories['Impact Analysis'].push(table)
      } else if (name.includes('cultural') || name.includes('elder') || name.includes('consent') || name.includes('moderation')) {
        categories['Cultural Safety'].push(table)
      } else if (name.includes('community') || name.includes('empathy') || name.includes('event') || name.includes('feedback')) {
        categories['Community'].push(table)
      } else if (name.includes('partner') || name.includes('access_token')) {
        categories['Partner Portal'].push(table)
      } else if (name.includes('theme')) {
        categories['Themes'].push(table)
      } else if (name.includes('search')) {
        categories['Search'].push(table)
      } else if (name.includes('audit') || name.includes('log') || name.includes('webhook') || name.includes('system') || name.includes('migration')) {
        categories['System'].push(table)
      } else {
        categories['Other'].push(table)
      }
    })

    return categories
  }, [initialTables])

  // Filter tables based on search and category
  const filteredTables = useMemo(() => {
    let tables = initialTables

    if (selectedCategory !== 'all') {
      tables = categorizedTables[selectedCategory] || []
    }

    if (searchQuery) {
      tables = tables.filter(t =>
        t.table_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return tables.sort((a, b) => a.table_name.localeCompare(b.table_name))
  }, [initialTables, searchQuery, selectedCategory, categorizedTables])

  // Calculate category stats
  const categoryStats = useMemo(() => {
    return Object.entries(categorizedTables).map(([name, tables]) => ({
      name,
      count: tables.length,
      tables: tables.length
    })).filter(cat => cat.count > 0)
  }, [categorizedTables])

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Tables</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{initialTables.length}</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Categories</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{categoryStats.length}</div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">With RLS</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {initialTables.filter(t => t.has_rls).length}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-1">
            <Table2 className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Filtered</span>
          </div>
          <div className="text-2xl font-bold text-amber-600">{filteredTables.length}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories ({initialTables.length})</option>
          {categoryStats.map(cat => (
            <option key={cat.name} value={cat.name}>
              {cat.name} ({cat.count})
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-muted'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-muted'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Category Overview */}
      {selectedCategory === 'all' && !searchQuery && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Database Structure</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="text-left p-4 bg-background rounded-lg border hover:border-primary-500 transition-colors"
              >
                <div className="font-semibold text-foreground mb-1">{cat.name}</div>
                <div className="text-sm text-muted-foreground">{cat.count} tables</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tables Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map(table => (
            <TableCard key={table.table_name} table={table} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTables.map(table => (
            <TableRow key={table.table_name} table={table} />
          ))}
        </div>
      )}

      {filteredTables.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tables found matching your search.</p>
        </div>
      )}

      {/* Documentation Links */}
      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Related Documentation
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/docs/database/SCHEMA_SUMMARY.md" className="text-blue-600 hover:underline">
            → Schema Summary (Generated)
          </a>
          <a href="/docs/IMPACT_SYSTEM_ARCHITECTURE.md" className="text-blue-600 hover:underline">
            → Impact System Architecture
          </a>
          <a href="/docs/database/README.md" className="text-blue-600 hover:underline">
            → Database Documentation Index
          </a>
          <a href="/impact/demo" className="text-blue-600 hover:underline">
            → Impact Analysis Demo
          </a>
        </div>
      </div>
    </div>
  )
}

function TableCard({ table }: { table: TableInfo }) {
  return (
    <div className="p-4 bg-background border rounded-lg hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Table2 className="w-4 h-4 text-primary-600" />
          <h3 className="font-mono text-sm font-semibold">{table.table_name}</h3>
        </div>
        {table.has_rls && (
          <Shield className="w-4 h-4 text-green-600" title="Has RLS enabled" />
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Columns className="w-3 h-3" />
          {table.column_count} columns
        </span>
      </div>

      {table.description && (
        <p className="mt-2 text-xs text-muted-foreground">{table.description}</p>
      )}

      <button className="mt-3 text-xs text-primary-600 hover:underline">
        View Details →
      </button>
    </div>
  )
}

function TableRow({ table }: { table: TableInfo }) {
  return (
    <div className="flex items-center justify-between p-3 bg-background border rounded-lg hover:border-primary-500 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <Table2 className="w-4 h-4 text-primary-600" />
        <span className="font-mono text-sm font-medium">{table.table_name}</span>
        <span className="text-xs text-muted-foreground">{table.column_count} columns</span>
        {table.has_rls && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Shield className="w-3 h-3" />
            RLS
          </div>
        )}
      </div>
      <button className="text-xs text-primary-600 hover:underline">View Details →</button>
    </div>
  )
}
