import fs from 'fs'
import path from 'path'

/**
 * Interactive Database Diagram
 * Embeds the interactive HTML dashboard showing all tables organized by system
 */

export const metadata = {
  title: 'Interactive Diagram | Empathy Ledger Admin',
  description: 'Interactive database diagram with system categorization'
}

export default async function InteractiveDiagramPage() {
  // Read the HTML file from docs
  const filePath = path.join(process.cwd(), 'docs', 'database', 'INTERACTIVE_DIAGRAM.html')
  const htmlContent = fs.readFileSync(filePath, 'utf-8')

  // Return the full HTML content with proper sizing
  return (
    <div className="absolute inset-0 w-full h-full overflow-auto">
      <iframe
        srcDoc={htmlContent}
        className="w-full min-h-full border-0"
        title="Interactive Database Diagram"
        style={{ width: '100%', minHeight: '100%' }}
      />
    </div>
  )
}
