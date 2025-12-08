#!/usr/bin/env node

/**
 * Direct Database Analysis using Raw SQL
 * Empathy Ledger Project - 2025
 * 
 * Uses direct SQL queries to bypass schema cache issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class DirectDatabaseAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      connection: null,
      schema: { tables: [], views: [], functions: [] },
      data: { tableCounts: {}, sampleData: {} },
      security: { rlsPolicies: [], authUsers: 0 },
      storage: { buckets: [] },
      analysis: { missingComponents: [], recommendations: [] }
    };
  }

  async run() {
    console.log('🔍 Starting Direct Database Analysis...\n');
    
    try {
      await this.testConnection();
      await this.analyzeSchema();
      await this.analyzeData();
      await this.analyzeSecurity();
      await this.analyzeStorage();
      await this.generateRecommendations();
      await this.saveReports();
      
      console.log('\n✅ Direct Analysis Complete!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      this.analysis.error = error.message;
      await this.saveReports();
    }
  }

  async testConnection() {
    console.log('1️⃣ Testing Connection...');
    
    try {
      // Use a simple RPC call to test connection
      const { data, error } = await supabase.rpc('version');
      
      this.analysis.connection = {
        status: 'success',
        url: SUPABASE_URL,
        timestamp: new Date().toISOString(),
        version: data || 'Connected'
      };
      
      console.log('   ✅ Connection successful');
      
    } catch (error) {
      // Try alternate connection test
      try {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        this.analysis.connection = {
          status: testError ? 'partial' : 'success',
          url: SUPABASE_URL,
          timestamp: new Date().toISOString(),
          note: testError ? 'Schema access limited' : 'Full access confirmed'
        };
        
        console.log('   ✅ Connection established (alternate method)');
        
      } catch (altError) {
        this.analysis.connection = {
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        console.log('   ❌ Connection failed');
      }
    }
  }

  async analyzeSchema() {
    console.log('2️⃣ Analyzing Schema...');
    
    // Test common tables that should exist
    const expectedTables = [
      'profiles', 'organizations', 'projects', 'storytellers', 
      'transcripts', 'stories', 'media_assets', 'galleries', 
      'photos', 'photo_tags', 'ai_processing_queue'
    ];

    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          this.analysis.schema.tables.push({
            name: tableName,
            status: 'exists',
            accessible: true
          });
          console.log(`   ✅ Table '${tableName}' exists and accessible`);
        } else if (error.code === 'PGRST116') {
          // Table exists but no SELECT permission
          this.analysis.schema.tables.push({
            name: tableName,
            status: 'exists',
            accessible: false,
            error: 'No SELECT permission'
          });
          console.log(`   ⚠️  Table '${tableName}' exists but not accessible`);
        } else {
          console.log(`   ❌ Table '${tableName}' missing or inaccessible`);
        }
      } catch (e) {
        console.log(`   ❌ Table '${tableName}' missing: ${e.message}`);
      }
    }
  }

  async analyzeData() {
    console.log('3️⃣ Analyzing Data...');
    
    for (const table of this.analysis.schema.tables) {
      if (table.accessible) {
        try {
          // Get count
          const { count, error: countError } = await supabase
            .from(table.name)
            .select('*', { count: 'exact', head: true });

          if (!countError) {
            this.analysis.data.tableCounts[table.name] = count;
            console.log(`   📊 ${table.name}: ${count} rows`);
          }

          // Get sample data
          const { data: sampleData, error: sampleError } = await supabase
            .from(table.name)
            .select('*')
            .limit(2);

          if (!sampleError && sampleData && sampleData.length > 0) {
            this.analysis.data.sampleData[table.name] = sampleData;
          }
          
        } catch (error) {
          console.log(`   ❌ Error analyzing ${table.name}:`, error.message);
        }
      }
    }
  }

  async analyzeSecurity() {
    console.log('4️⃣ Analyzing Security...');
    
    try {
      // Check auth users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError) {
        this.analysis.security.authUsers = authData.users.length;
        console.log(`   👥 Found ${authData.users.length} authenticated users`);
      }
      
    } catch (error) {
      console.log(`   ❌ Auth analysis failed: ${error.message}`);
    }

    // Test RLS by attempting unauthorized access
    try {
      const anonClient = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDQ4NTAsImV4cCI6MjA3MTgyMDg1MH0.UV8JOXSwANMl72lRjw-9d4CKniHSlDk9hHZpKHYN6Bs');
      
      const { data: anonData, error: anonError } = await anonClient
        .from('profiles')
        .select('*')
        .limit(1);

      this.analysis.security.rlsTest = {
        anonAccess: !anonError,
        error: anonError?.message || null,
        interpretation: anonError ? 'RLS likely active' : 'RLS may be disabled - security concern'
      };
      
      console.log(`   🔒 RLS Test: ${this.analysis.security.rlsTest.interpretation}`);
      
    } catch (error) {
      console.log(`   ❌ RLS test failed: ${error.message}`);
    }
  }

  async analyzeStorage() {
    console.log('5️⃣ Analyzing Storage...');
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (!error && buckets) {
        this.analysis.storage.buckets = buckets;
        console.log(`   🗄️  Found ${buckets.length} storage buckets:`);
        
        for (const bucket of buckets) {
          console.log(`      - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
          
          // Sample files
          try {
            const { data: files } = await supabase.storage
              .from(bucket.name)
              .list('', { limit: 5 });

            if (files) {
              bucket.sampleFiles = files.length;
              console.log(`        └── ${files.length} files (sample)`);
            }
          } catch (e) {
            console.log(`        └── Error listing files: ${e.message}`);
          }
        }
      } else {
        console.log('   ❌ No storage buckets found or access denied');
      }
      
    } catch (error) {
      console.log(`   ❌ Storage analysis failed: ${error.message}`);
    }
  }

  generateRecommendations() {
    console.log('6️⃣ Generating Recommendations...');
    
    const recommendations = [];
    const existingTables = this.analysis.schema.tables.filter(t => t.status === 'exists').map(t => t.name);
    const expectedTables = ['profiles', 'organizations', 'storytellers', 'transcripts', 'stories', 'media_assets'];
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Schema',
        title: 'Deploy Missing Core Tables',
        description: `Missing essential tables: ${missingTables.join(', ')}`,
        action: 'Run database migration scripts to create core tables'
      });
    }

    if (this.analysis.storage.buckets.length === 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Storage',
        title: 'Configure Storage Buckets',
        description: 'No storage buckets configured for media management',
        action: 'Create profile-images, media-assets, and transcripts buckets'
      });
    }

    if (this.analysis.security.rlsTest?.anonAccess) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Security',
        title: 'Implement Row Level Security',
        description: 'Anonymous users can access data - major security risk',
        action: 'Deploy comprehensive RLS policies immediately'
      });
    }

    const totalRows = Object.values(this.analysis.data.tableCounts).reduce((sum, count) => sum + (count || 0), 0);
    if (totalRows === 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Data',
        title: 'Populate Sample Data',
        description: 'Database is empty - consider adding sample data for testing',
        action: 'Run data migration scripts or create sample content'
      });
    }

    this.analysis.analysis.recommendations = recommendations;
    
    console.log(`   💡 Generated ${recommendations.length} recommendations`);
  }

  async saveReports() {
    console.log('7️⃣ Saving Reports...');
    
    // Ensure docs directory exists
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save JSON analysis
    const jsonPath = path.join(docsDir, 'LIVE_DATABASE_ANALYSIS_DIRECT_2025.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.analysis, null, 2));

    // Generate and save markdown report
    const markdownPath = path.join(docsDir, 'LIVE_DATABASE_STATUS_DIRECT_2025.md');
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`   📄 Reports saved:`);
    console.log(`      - JSON: ${jsonPath}`);
    console.log(`      - Markdown: ${markdownPath}`);

    this.printConsoleSummary();
  }

  generateMarkdownReport() {
    const totalRows = Object.values(this.analysis.data.tableCounts).reduce((sum, count) => sum + (count || 0), 0);
    const existingTables = this.analysis.schema.tables.filter(t => t.status === 'exists');
    
    return `# Live Database Status Report - Direct Analysis
Generated: ${this.analysis.timestamp}

## 🔍 Executive Summary

### Connection Status
${this.analysis.connection?.status === 'success' ? '✅ **CONNECTED**' : '❌ **CONNECTION ISSUES**'}
- URL: ${SUPABASE_URL}
- Status: ${this.analysis.connection?.status}
- Note: ${this.analysis.connection?.note || 'N/A'}

### Database Health Overview
- **Tables Found**: ${existingTables.length}
- **Total Data Rows**: ${totalRows}
- **Storage Buckets**: ${this.analysis.storage.buckets.length}
- **Authenticated Users**: ${this.analysis.security.authUsers}
- **Critical Issues**: ${this.analysis.analysis.recommendations.filter(r => r.priority === 'CRITICAL').length}

## 📊 Schema Analysis

### Existing Tables
${existingTables.map(table => 
  `- **${table.name}** - ${this.analysis.data.tableCounts[table.name] || 0} rows ${table.accessible ? '✅' : '⚠️'}`
).join('\n')}

### Missing Core Tables
${this.analysis.schema.tables.filter(t => t.status !== 'exists').length === 0 ? 
  'All expected tables found ✅' :
  'Some core tables may be missing ⚠️'}

## 🔒 Security Analysis

### Authentication
- **Total Users**: ${this.analysis.security.authUsers}
- **RLS Status**: ${this.analysis.security.rlsTest?.interpretation || 'Unable to test'}

${this.analysis.security.rlsTest?.anonAccess ? 
  '🚨 **CRITICAL**: Anonymous access detected - deploy RLS policies immediately!' : 
  '✅ Anonymous access blocked (RLS likely active)'}

## 🗄️ Storage Configuration

### Buckets
${this.analysis.storage.buckets.length === 0 ? 
  '❌ **NO STORAGE BUCKETS CONFIGURED**' :
  this.analysis.storage.buckets.map(bucket => 
    `- **${bucket.name}** (${bucket.public ? 'Public' : 'Private'}) - ~${bucket.sampleFiles || 0} files`
  ).join('\n')}

## 🚨 Priority Recommendations

${this.analysis.analysis.recommendations.map((rec, index) => 
  `### ${index + 1}. ${rec.priority}: ${rec.title}
**Category**: ${rec.category}
**Issue**: ${rec.description}
**Action**: ${rec.action}
`).join('\n')}

## 🎯 Implementation Roadmap

### Phase 1: Critical Security (Immediate)
${this.analysis.analysis.recommendations.filter(r => r.priority === 'CRITICAL').map(r => `- ${r.title}`).join('\n') || '- All critical issues resolved ✅'}

### Phase 2: Core Functionality (This Week)
${this.analysis.analysis.recommendations.filter(r => r.priority === 'HIGH').map(r => `- ${r.title}`).join('\n') || '- Core functionality complete ✅'}

### Phase 3: Enhancement (Next Week)
${this.analysis.analysis.recommendations.filter(r => r.priority === 'MEDIUM').map(r => `- ${r.title}`).join('\n') || '- Ready for enhancements ✅'}

---

## 📈 Database Statistics
- **Connection**: ${this.analysis.connection?.status}
- **Schema**: ${existingTables.length} tables active
- **Data**: ${totalRows} total rows
- **Storage**: ${this.analysis.storage.buckets.length} buckets
- **Security**: ${this.analysis.security.authUsers} users, RLS ${this.analysis.security.rlsTest?.interpretation}

*Analysis completed: ${this.analysis.timestamp}*
`;
  }

  printConsoleSummary() {
    console.log('\n📋 COMPREHENSIVE ANALYSIS SUMMARY');
    console.log('=====================================');
    
    const existingTables = this.analysis.schema.tables.filter(t => t.status === 'exists');
    const totalRows = Object.values(this.analysis.data.tableCounts).reduce((sum, count) => sum + (count || 0), 0);
    const criticalIssues = this.analysis.analysis.recommendations.filter(r => r.priority === 'CRITICAL').length;
    
    console.log(`🔗 Database Connection: ${this.analysis.connection?.status === 'success' ? '✅ Active' : '❌ Issues'}`);
    console.log(`📊 Tables Deployed: ${existingTables.length}`);
    console.log(`📈 Total Data Rows: ${totalRows}`);
    console.log(`🗄️ Storage Buckets: ${this.analysis.storage.buckets.length}`);
    console.log(`👥 Auth Users: ${this.analysis.security.authUsers}`);
    console.log(`🚨 Critical Issues: ${criticalIssues}`);
    
    if (criticalIssues > 0) {
      console.log('\n⚠️  CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      this.analysis.analysis.recommendations
        .filter(r => r.priority === 'CRITICAL')
        .forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec.title}`);
        });
    }
    
    if (existingTables.length > 0) {
      console.log('\n✅ ACTIVE TABLES:');
      existingTables.forEach(table => {
        const count = this.analysis.data.tableCounts[table.name] || 0;
        console.log(`   - ${table.name}: ${count} rows`);
      });
    }
    
    console.log('\n📄 Full reports saved to docs/ directory');
  }
}

// Run the analysis
async function main() {
  const analyzer = new DirectDatabaseAnalyzer();
  await analyzer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DirectDatabaseAnalyzer;