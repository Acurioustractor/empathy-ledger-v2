import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

export interface PDFExportOptions {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'letter' | 'a3'
  fontSize?: number
  margin?: number
  includeTimestamp?: boolean
  watermark?: string
}

interface StoryData {
  title: string
  author: string
  content: string
  publishedAt?: Date
  tags?: string[]
  culturalBackground?: string
  viewCount?: number
  likeCount?: number
}

interface StorytellerData {
  name: string
  email?: string
  culturalBackground?: string
  location?: string
  bio?: string
  storyCount?: number
  joinedDate?: Date
}

interface ReportData {
  title: string
  subtitle?: string
  sections: {
    title: string
    content: string | { label: string; value: string | number }[]
    type: 'text' | 'list' | 'table'
  }[]
  charts?: { element: HTMLElement; title: string }[]
}

export class PDFExporter {
  private pdf: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number
  private lineHeight: number
  private fontSize: number

  constructor(options: PDFExportOptions = {}) {
    this.pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.format || 'a4'
    })

    // Set document properties
    this.pdf.setProperties({
      title: options.title || 'Export',
      author: options.author || 'Empathy Ledger',
      subject: options.subject || '',
      keywords: options.keywords?.join(', ') || '',
      creator: 'Empathy Ledger Platform'
    })

    // Set dimensions
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.margin = options.margin || 20
    this.currentY = this.margin
    this.fontSize = options.fontSize || 12
    this.lineHeight = this.fontSize * 0.5

    // Set default font
    this.pdf.setFontSize(this.fontSize)
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage()
      this.currentY = this.margin
      return true
    }
    return false
  }

  private addText(text: string, options: { 
    fontSize?: number, 
    bold?: boolean, 
    centre?: boolean,
    colour?: string 
  } = {}) {
    const fontSize = options.fontSize || this.fontSize
    this.pdf.setFontSize(fontSize)
    
    if (options.bold) {
      this.pdf.setFont('helvetica', 'bold')
    } else {
      this.pdf.setFont('helvetica', 'normal')
    }

    if (options.colour) {
      const [r, g, b] = options.colour.split(',').map(Number)
      this.pdf.setTextColor(r, g, b)
    } else {
      this.pdf.setTextColor(0, 0, 0)
    }

    const lines = this.pdf.splitTextToSize(text, this.pageWidth - (2 * this.margin))
    const requiredSpace = lines.length * fontSize * 0.5

    this.checkPageBreak(requiredSpace)

    if (options.centre) {
      const textWidth = this.pdf.getTextWidth(text)
      const x = (this.pageWidth - textWidth) / 2
      this.pdf.text(lines, x, this.currentY)
    } else {
      this.pdf.text(lines, this.margin, this.currentY)
    }

    this.currentY += requiredSpace
    this.pdf.setTextColor(0, 0, 0) // Reset colour
  }

  private addLine() {
    this.checkPageBreak(5)
    this.pdf.setDrawColor(200, 200, 200)
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 5
  }

  private addSpace(space: number = 10) {
    this.currentY += space
  }

  async exportStory(story: StoryData, options: PDFExportOptions = {}): Promise<Blob> {
    // Title
    this.addText(story.title, { fontSize: 24, bold: true, centre: true })
    this.addSpace(5)

    // Author and metadata
    this.addText(`By ${story.author}`, { fontSize: 14, centre: true, colour: '100,100,100' })
    
    if (story.publishedAt) {
      this.addText(`Published: ${format(story.publishedAt, 'MMMM d, yyyy')}`, { 
        fontSize: 10, 
        centre: true, 
        colour: '150,150,150' 
      })
    }

    if (story.culturalBackground) {
      this.addText(`Cultural Background: ${story.culturalBackground}`, {
        fontSize: 10,
        centre: true,
        colour: '150,150,150'
      })
    }

    this.addSpace(10)
    this.addLine()
    this.addSpace(10)

    // Content (handle HTML)
    const cleanContent = story.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')

    // Split content into paragraphs
    const paragraphs = cleanContent.split('\n\n')
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        this.addText(paragraph)
        this.addSpace(5)
      }
    }

    // Footer with metadata
    if (story.tags && story.tags.length > 0) {
      this.addSpace(10)
      this.addLine()
      this.addText(`Tags: ${story.tags.join(', ')}`, { fontSize: 10, colour: '100,100,100' })
    }

    if (story.viewCount !== undefined || story.likeCount !== undefined) {
      this.addSpace(5)
      const stats = []
      if (story.viewCount !== undefined) stats.push(`${story.viewCount} views`)
      if (story.likeCount !== undefined) stats.push(`${story.likeCount} likes`)
      this.addText(stats.join(' • '), { fontSize: 10, colour: '100,100,100' })
    }

    // Add timestamp if requested
    if (options.includeTimestamp) {
      this.currentY = this.pageHeight - this.margin - 10
      this.addText(`Generated on ${format(new Date(), 'PPP')}`, {
        fontSize: 8,
        centre: true,
        colour: '150,150,150'
      })
    }

    return this.pdf.output('blob')
  }

  async exportStoryteller(storyteller: StorytellerData, options: PDFExportOptions = {}): Promise<Blob> {
    // Header
    this.addText('Storyteller Profile', { fontSize: 10, centre: true, colour: '150,150,150' })
    this.addSpace(5)
    
    // Name
    this.addText(storyteller.name, { fontSize: 24, bold: true, centre: true })
    this.addSpace(10)

    // Details section
    const details = [
      storyteller.email && `Email: ${storyteller.email}`,
      storyteller.culturalBackground && `Cultural Background: ${storyteller.culturalBackground}`,
      storyteller.location && `Location: ${storyteller.location}`,
      storyteller.joinedDate && `Member Since: ${format(storyteller.joinedDate, 'MMMM yyyy')}`,
      storyteller.storyCount !== undefined && `Published Stories: ${storyteller.storyCount}`
    ].filter(Boolean)

    for (const detail of details) {
      if (detail) {
        this.addText(detail, { fontSize: 12 })
        this.addSpace(3)
      }
    }

    // Bio section
    if (storyteller.bio) {
      this.addSpace(10)
      this.addLine()
      this.addSpace(10)
      this.addText('Biography', { fontSize: 16, bold: true })
      this.addSpace(5)
      this.addText(storyteller.bio)
    }

    // Timestamp
    if (options.includeTimestamp) {
      this.currentY = this.pageHeight - this.margin - 10
      this.addText(`Generated on ${format(new Date(), 'PPP')}`, {
        fontSize: 8,
        centre: true,
        colour: '150,150,150'
      })
    }

    return this.pdf.output('blob')
  }

  async exportReport(report: ReportData, options: PDFExportOptions = {}): Promise<Blob> {
    // Title page
    this.currentY = this.pageHeight / 3
    this.addText(report.title, { fontSize: 32, bold: true, centre: true })
    
    if (report.subtitle) {
      this.addSpace(10)
      this.addText(report.subtitle, { fontSize: 18, centre: true, colour: '100,100,100' })
    }

    this.addSpace(20)
    this.addText(`Generated on ${format(new Date(), 'PPP')}`, {
      fontSize: 12,
      centre: true,
      colour: '150,150,150'
    })

    // Content sections
    for (const section of report.sections) {
      this.pdf.addPage()
      this.currentY = this.margin

      // Section title
      this.addText(section.title, { fontSize: 20, bold: true })
      this.addSpace(10)

      // Section content based on type
      switch (section.type) {
        case 'text':
          this.addText(section.content as string)
          break

        case 'list':
          const items = section.content as { label: string; value: string | number }[]
          for (const item of items) {
            this.addText(`• ${item.label}: ${item.value}`, { fontSize: 12 })
            this.addSpace(3)
          }
          break

        case 'table':
          // Simple table rendering
          const tableData = section.content as { label: string; value: string | number }[]
          for (const row of tableData) {
            this.checkPageBreak(10)
            const y = this.currentY
            
            // Label column
            this.pdf.text(row.label, this.margin, y)
            
            // Value column
            const valueX = this.pageWidth / 2
            this.pdf.text(String(row.value), valueX, y)
            
            this.currentY += 7
          }
          break
      }

      this.addSpace(10)
    }

    // Add charts if provided
    if (report.charts && report.charts.length > 0) {
      for (const chart of report.charts) {
        this.pdf.addPage()
        this.currentY = this.margin

        // Chart title
        this.addText(chart.title, { fontSize: 18, bold: true, centre: true })
        this.addSpace(10)

        // Convert chart element to image
        try {
          const canvas = await html2canvas(chart.element, {
            scale: 2,
            logging: false,
            backgroundColor: '#ffffff'
          })
          
          const imgData = canvas.toDataURL('image/png')
          const imgWidth = this.pageWidth - (2 * this.margin)
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          this.checkPageBreak(imgHeight)
          this.pdf.addImage(imgData, 'PNG', this.margin, this.currentY, imgWidth, imgHeight)
          this.currentY += imgHeight
        } catch (error) {
          console.error('Failed to add chart to PDF:', error)
        }
      }
    }

    return this.pdf.output('blob')
  }

  async exportTable(data: any[], columns: { key: string; label: string }[], title?: string): Promise<Blob> {
    if (title) {
      this.addText(title, { fontSize: 20, bold: true, centre: true })
      this.addSpace(10)
    }

    // Table header
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    
    const colWidth = (this.pageWidth - (2 * this.margin)) / columns.length
    let x = this.margin

    for (const col of columns) {
      this.pdf.text(col.label, x, this.currentY)
      x += colWidth
    }

    this.currentY += 7
    this.addLine()

    // Table rows
    this.pdf.setFont('helvetica', 'normal')
    
    for (const row of data) {
      this.checkPageBreak(10)
      x = this.margin
      
      for (const col of columns) {
        const value = String(row[col.key] || '')
        const truncated = value.length > 20 ? value.substring(0, 17) + '...' : value
        this.pdf.text(truncated, x, this.currentY)
        x += colWidth
      }
      
      this.currentY += 7
    }

    return this.pdf.output('blob')
  }

  save(filename: string) {
    this.pdf.save(filename)
  }

  getBlob(): Blob {
    return this.pdf.output('blob')
  }
}

// Utility function for quick PDF export
export async function exportToPDF(
  data: any,
  type: 'story' | 'storyteller' | 'report' | 'table',
  options: PDFExportOptions = {}
): Promise<void> {
  const exporter = new PDFExporter(options)
  let blob: Blob

  switch (type) {
    case 'story':
      blob = await exporter.exportStory(data, options)
      break
    case 'storyteller':
      blob = await exporter.exportStoryteller(data, options)
      break
    case 'report':
      blob = await exporter.exportReport(data, options)
      break
    case 'table':
      blob = await exporter.exportTable(data.rows, data.columns, data.title)
      break
    default:
      throw new Error(`Unsupported export type: ${type}`)
  }

  // Download the PDF
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.title || 'export'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}