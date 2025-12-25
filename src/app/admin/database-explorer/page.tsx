import { createClient } from '@/lib/supabase/server'
import { DatabaseExplorerClient } from '@/components/admin/DatabaseExplorerClient'

/**
 * Database Explorer - Visual Database Documentation
 *
 * Interactive explorer showing all Supabase tables, columns, relationships
 * Helps review and refine database structure
 */

export const metadata = {
  title: 'Database Explorer | Empathy Ledger',
  description: 'Visual database documentation and explorer'
}

export default async function DatabaseExplorerPage() {
  const supabase = await createClient()

  // Fetch all table information from information_schema
  const { data: tables } = await supabase.rpc('get_database_schema')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Database Explorer</h1>
        <p className="text-lg text-muted-foreground">
          Visual documentation of all {tables?.length || 106} tables in the Empathy Ledger database
        </p>
      </div>

      <DatabaseExplorerClient initialTables={tables || []} />
    </div>
  )
}
