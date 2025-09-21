import { format } from 'date-fns'
import { PDFExporter } from './pdf-export'

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  fields?: string[]
  filename?: string
  onProgress?: (progress: number) => void
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], fields?: string[]): string {
  if (data.length === 0) return ''
  
  // Get fields from first object if not provided
  const headers = fields || Object.keys(data[0])
  
  // Create CSV header
  const csvHeader = headers.map(field => `"${field}"`).join(',')
  
  // Create CSV rows
  const csvRows = data.map(row => {
    return headers.map(field => {
      const value = row[field]
      
      // Handle different types
      if (value === null || value === undefined) return '""'
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
      return `"${value}"`
    }).join(',')
  })
  
  return [csvHeader, ...csvRows].join('\n')
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data in various formats
 */
export async function exportData(data: any[], options: ExportOptions) {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm')
  const filename = options.filename || `export-${timestamp}`
  
  switch (options.format) {
    case 'csv': {
      const csv = arrayToCSV(data, options.fields)
      downloadFile(csv, `${filename}.csv`, 'text/csv')
      break
    }
    
    case 'json': {
      const json = JSON.stringify(data, null, 2)
      downloadFile(json, `${filename}.json`, 'application/json')
      break
    }
    
    case 'pdf': {
      const exporter = new PDFExporter({
        title: filename,
        includeTimestamp: true
      })
      
      // Convert data to PDF based on content
      const formattedData = options.fields 
        ? data.map(item => {
            const filtered: any = {}
            options.fields?.forEach(field => {
              filtered[field] = item[field]
            })
            return filtered
          })
        : data
      
      // Create a simple table PDF
      const columns = options.fields 
        ? options.fields.map(field => ({ key: field, label: field }))
        : Object.keys(data[0] || {}).map(key => ({ key, label: key }))
      
      const blob = await exporter.exportTable(formattedData, columns, filename)
      
      // Download the PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      break
    }
    
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

/**
 * Format data for storyteller export
 */
export function formatStorytellerExport(storytellers: any[]) {
  return storytellers.map(s => ({
    'Name': s.displayName,
    'Email': s.email,
    'Cultural Background': s.culturalBackground || 'Not specified',
    'Location': s.location || 'Not specified',
    'Organization': s.organisation || 'Independent',
    'Stories Published': s.storyCount,
    'Engagement Rate': `${s.engagementRate}%`,
    'Status': s.status,
    'Elder': s.isElder ? 'Yes' : 'No',
    'Featured': s.isFeatured ? 'Yes' : 'No',
    'Joined Date': format(new Date(s.createdAt), 'yyyy-MM-dd'),
    'Last Active': format(new Date(s.lastActive), 'yyyy-MM-dd'),
  }))
}

/**
 * Format data for story export
 */
export function formatStoryExport(stories: any[]) {
  return stories.map(s => ({
    'Title': s.title,
    'Author': s.author?.displayName || 'Unknown',
    'Status': s.status,
    'Views': s.viewCount || 0,
    'Likes': s.likeCount || 0,
    'Comments': s.commentCount || 0,
    'Published Date': s.publishedAt ? format(new Date(s.publishedAt), 'yyyy-MM-dd') : 'Not published',
    'Created Date': format(new Date(s.createdAt), 'yyyy-MM-dd'),
    'Tags': s.tags?.join(', ') || '',
    'Cultural Sensitivity': s.culturalSensitivity || 'General',
    'Visibility': s.visibility || 'Public',
  }))
}

/**
 * Batch export with progress callback
 */
export async function batchExport(
  fetchFunction: (page: number) => Promise<any[]>,
  options: ExportOptions & { onProgress?: (progress: number) => void }
) {
  const allData: any[] = []
  let page = 1
  let hasMore = true
  
  while (hasMore) {
    try {
      const data = await fetchFunction(page)
      
      if (data.length === 0) {
        hasMore = false
      } else {
        allData.push(...data)
        page++
        
        // Report progress
        if (options.onProgress) {
          // Estimate progress (assumes max 10 pages for demo)
          const progress = Math.min((page / 10) * 100, 95)
          options.onProgress(progress)
        }
      }
    } catch (error) {
      console.error('Error fetching page:', page, error)
      hasMore = false
    }
  }
  
  // Export the collected data
  await exportData(allData, options)
  
  if (options.onProgress) {
    options.onProgress(100)
  }
  
  return allData.length
}