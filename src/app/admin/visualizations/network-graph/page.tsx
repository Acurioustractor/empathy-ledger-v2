import fs from 'fs'
import path from 'path'

/**
 * Network Graph Visualization
 * Embeds the D3.js force-directed graph showing database relationships
 */

export const metadata = {
  title: 'Network Graph | Empathy Ledger Admin',
  description: 'Interactive force-directed graph of database relationships'
}

export default async function NetworkGraphPage() {
  // Read the HTML file from docs
  const filePath = path.join(process.cwd(), 'docs', 'database', 'NETWORK_GRAPH.html')
  const htmlContent = fs.readFileSync(filePath, 'utf-8')

  // Return the full HTML content with proper sizing
  return (
    <div className="absolute inset-0 w-full h-full">
      <iframe
        srcDoc={htmlContent}
        className="absolute inset-0 w-full h-full border-0"
        title="Database Network Graph"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
