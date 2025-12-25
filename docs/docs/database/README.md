# Database Visualizations

**Visual tools to understand the Empathy Ledger database architecture**

## 🎨 Available Visualizations

### 1. Mermaid Diagrams (Markdown)
**File**: [DATABASE_DIAGRAM.md](./DATABASE_DIAGRAM.md)

Contains multiple Mermaid diagrams:
- **Entity Relationship Diagram** - Complete ERD with all relationships
- **System Architecture** - High-level system overview
- **Data Flow Diagrams** - How data moves through the system
- **Security Layers** - RLS policy visualization
- **Table Statistics** - Pie charts and metrics

**How to view:**
- Open in GitHub/GitLab (renders automatically)
- VS Code with Mermaid extension
- [Mermaid Live Editor](https://mermaid.live)

### 2. Interactive Dashboard (HTML)
**File**: [INTERACTIVE_DIAGRAM.html](./INTERACTIVE_DIAGRAM.html)

Interactive web interface with:
- **System cards** - Click to expand table lists
- **Search functionality** - Find any table instantly
- **Data flow visualization** - Story creation workflow
- **Color-coded systems** - Easy visual navigation
- **Stats dashboard** - Key database metrics

**How to open:**
```bash
# Mac
open docs/database/INTERACTIVE_DIAGRAM.html

# Linux
xdg-open docs/database/INTERACTIVE_DIAGRAM.html

# Windows
start docs/database/INTERACTIVE_DIAGRAM.html
```

### 3. Network Graph (D3.js)
**File**: [NETWORK_GRAPH.html](./NETWORK_GRAPH.html)

Advanced interactive graph showing:
- **Node relationships** - Visual connections between tables
- **Force-directed layout** - Automatic positioning
- **Drag and zoom** - Explore the network
- **System filtering** - Focus on specific areas
- **Connection highlighting** - Click nodes to see relationships

**How to open:**
```bash
# Mac
open docs/database/NETWORK_GRAPH.html

# Linux
xdg-open docs/database/NETWORK_GRAPH.html

# Windows
start docs/database/NETWORK_GRAPH.html
```

**Features:**
- Zoom and pan with mouse
- Drag nodes to reorganize
- Click nodes for connection details
- Filter by system type
- Responsive design

## 📊 What Each Visualization Shows

### Mermaid Diagrams (Static)

**Best for:**
- Documentation and README files
- GitHub/GitLab wikis
- Presentations (export as PNG/SVG)
- Quick reference

**Includes:**
```
✓ Complete ERD (all tables and relationships)
✓ System architecture overview
✓ Data flow diagrams (creation, sharing, analytics)
✓ Security layers (RLS policies)
✓ Relationship strength mapping
✓ Table size complexity chart
✓ Pie charts (tables by system, functions by category)
```

### Interactive Dashboard (Beginner-Friendly)

**Best for:**
- First-time exploration
- Quick table lookups
- Understanding system organization
- Non-technical stakeholders

**Features:**
```
✓ 9 system categories
✓ 87 tables organized
✓ Search box (instant filtering)
✓ Expandable table lists
✓ Color-coded systems
✓ Key statistics dashboard
✓ Story creation flow diagram
```

### Network Graph (Advanced)

**Best for:**
- Understanding relationships
- Exploring connections
- Finding dependency chains
- Technical architects

**Capabilities:**
```
✓ Force-directed graph layout
✓ Interactive node dragging
✓ Zoom and pan controls
✓ System-based filtering
✓ Click nodes for details
✓ Visual connection strength
✓ Real-time relationship display
```

## 🎯 Quick Start Guide

### For Developers

**Step 1** - See the big picture:
```bash
open docs/database/NETWORK_GRAPH.html
```

**Step 2** - Explore systems:
```bash
open docs/database/INTERACTIVE_DIAGRAM.html
```

**Step 3** - Deep dive:
```bash
cat docs/database/DATABASE_DIAGRAM.md
```

### For Technical Architects

**Understand relationships:**
1. Open [NETWORK_GRAPH.html](./NETWORK_GRAPH.html)
2. Click nodes to see connections
3. Use filters to focus on systems

**Document systems:**
1. View [DATABASE_DIAGRAM.md](./DATABASE_DIAGRAM.md)
2. Export Mermaid diagrams as PNG
3. Use in presentations/docs

### For Project Managers

**Get overview:**
1. Open [INTERACTIVE_DIAGRAM.html](./INTERACTIVE_DIAGRAM.html)
2. Read stats dashboard
3. Click systems to explore

## 🔍 Finding Specific Information

### "Show me all storyteller tables"

**Method 1** - Interactive Dashboard:
1. Open INTERACTIVE_DIAGRAM.html
2. Type "storyteller" in search
3. See highlighted systems

**Method 2** - Network Graph:
1. Open NETWORK_GRAPH.html
2. Click "Identity" filter
3. Explore connections

**Method 3** - Mermaid Diagram:
```bash
cat DATABASE_DIAGRAM.md | grep -A 10 "PROFILES"
```

### "How does media connect to stories?"

**Method 1** - Network Graph:
1. Open NETWORK_GRAPH.html
2. Click "Media Assets" node
3. See connections to stories

**Method 2** - Mermaid ERD:
```bash
cat DATABASE_DIAGRAM.md | grep -A 20 "erDiagram"
```

### "What are the analytics tables?"

**Method 1** - Interactive Dashboard:
1. Open INTERACTIVE_DIAGRAM.html
2. Click "Analytics & Metrics" card
3. See 13 tables listed

**Method 2** - Filter network:
1. Open NETWORK_GRAPH.html
2. Click "Analytics" filter
3. See only analytics nodes

## 🎨 Customization

### Export Diagrams

**Mermaid to PNG/SVG:**
1. Copy diagram code from DATABASE_DIAGRAM.md
2. Visit [mermaid.live](https://mermaid.live)
3. Paste code
4. Click Export → PNG/SVG

**Screenshot Interactive:**
- Open INTERACTIVE_DIAGRAM.html or NETWORK_GRAPH.html
- Use browser screenshot tools
- Or use OS screenshot (Cmd+Shift+4 on Mac)

### Modify Visualizations

**Colors:**
Edit the `colors` object in HTML files:
```javascript
const colors = {
    identity: '#FF6B6B',  // Change to your color
    content: '#4ECDC4',
    // ...
};
```

**Add Tables:**
Edit the `systems` array in INTERACTIVE_DIAGRAM.html

**Add Nodes:**
Edit `graphData.nodes` in NETWORK_GRAPH.html

## 📚 Related Documentation

- [SCHEMA_SUMMARY.md](./SCHEMA_SUMMARY.md) - Complete table listing
- [DATABASE_MAP.md](./DATABASE_MAP.md) - Text-based system map
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common queries
- [../DATABASE_README.md](../DATABASE_README.md) - Main documentation

## 🆘 Troubleshooting

### Diagrams not rendering in GitHub

**Issue:** Mermaid diagrams show as code blocks
**Fix:** GitHub supports Mermaid natively - refresh the page

### Interactive HTML won't open

**Issue:** Browser security blocking local files
**Fix:**
```bash
# Start a simple HTTP server
python3 -m http.server 8000
# Open http://localhost:8000/docs/database/
```

### Network graph is too slow

**Issue:** Too many nodes/connections
**Fix:** Use system filters to reduce visible nodes

### Can't find a specific table

**Issue:** Table not showing in visualizations
**Fix:**
1. Check SCHEMA_SUMMARY.md for complete list
2. Regenerate docs: `./scripts/analyze-database.sh`

## 💡 Tips & Tricks

### Mermaid Diagrams

**Export for PowerPoint:**
1. Use Mermaid Live Editor
2. Export as SVG
3. Insert into slides

**Embed in Notion:**
1. Copy Mermaid code
2. Use code block with `mermaid` language
3. Renders automatically

### Interactive Dashboard

**Keyboard shortcuts:**
- Type immediately to search (no click needed)
- Press Escape to clear search

**Print-friendly:**
- Expand all cards before printing
- Use browser's print to PDF

### Network Graph

**Best viewing:**
- Zoom out to see overview
- Zoom in to read labels
- Drag nodes to organize

**Performance:**
- Use filters for large datasets
- Refresh if simulation stalls

## 🎓 Learning Path

**Level 1 - Overview** (5 min)
1. Open INTERACTIVE_DIAGRAM.html
2. Read stats
3. Click through systems

**Level 2 - Exploration** (15 min)
1. Open NETWORK_GRAPH.html
2. Try all filters
3. Click nodes to explore

**Level 3 - Deep Dive** (30 min)
1. Read DATABASE_DIAGRAM.md
2. Study ERD relationships
3. Review data flows

---

**Questions?** Check [DATABASE_README.md](../DATABASE_README.md) or use `/database-navigator` skill
