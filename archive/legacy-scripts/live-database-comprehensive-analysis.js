#!/usr/bin/env node

/**
 * Comprehensive Live Supabase Database Analysis
 * Empathy Ledger Project - 2025
 * 
 * This script performs a complete analysis of the live Supabase database
 * to understand current schema, data, security, and missing components.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Verified Supabase credentials
const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNDQ4NTAsImV4cCI6MjA3MTgyMDg1MH0.UV8JOXSwANMl72lRjw-9d4CKniHSlDk9hHZpKHYN6Bs';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';

// Create clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

class DatabaseAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      connection: null,
      schema: {
        tables: [],
        views: [],
        functions: [],
        triggers: []
      },
      data: {
        tableCounts: {},
        sampleData: {},
        dataQuality: {}
      },
      security: {
        rlsPolicies: [],
        authConfig: null,
        storagePolicies: []
      },
      storage: {
        buckets: [],
        policies: [],
        usage: {}
      },
      performance: {
        indexes: [],
        constraints: [],
        stats: {}
      },
      missingComponents: [],
      recommendations: []
    };
  }

  async run() {
    console.log('🔍 Starting Comprehensive Database Analysis...\n');
    
    try {
      // 1. Connection Test
      await this.testConnection();
      
      // 2. Schema Analysis
      await this.analyzeSchema();
      
      // 3. Data Analysis
      await this.analyzeData();
      
      // 4. Security Analysis
      await this.analyzeSecurity();
      
      // 5. Storage Analysis
      await this.analyzeStorage();
      
      // 6. Performance Analysis
      await this.analyzePerformance();
      
      // 7. Gap Analysis
      await this.analyzeGaps();
      
      // 8. Generate Report
      await this.generateReport();
      
      console.log('\n✅ Analysis Complete!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      this.analysis.error = error.message;
      await this.generateReport();
    }
  }

  async testConnection() {
    console.log('1️⃣ Testing Database Connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      if (error) throw error;

      this.analysis.connection = {
        status: 'success',
        url: SUPABASE_URL,
        timestamp: new Date().toISOString()
      };
      
      console.log('   ✅ Connection successful');
      
    } catch (error) {
      this.analysis.connection = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      console.log('   ❌ Connection failed:', error.message);
      throw error;
    }
  }

  async analyzeSchema() {
    console.log('2️⃣ Analyzing Database Schema...');
    
    try {
      // Get all tables
      const { data: tables, error: tablesError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name, table_type, table_schema')
        .eq('table_schema', 'public');

      if (tablesError) throw tablesError;

      console.log(`   📊 Found ${tables.length} tables`);

      // Get detailed column information for each table
      for (const table of tables) {
        const { data: columns, error: columnsError } = await supabaseAdmin
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', table.table_name)
          .eq('table_schema', 'public');

        if (!columnsError && columns) {
          this.analysis.schema.tables.push({
            name: table.table_name,
            type: table.table_type,
            columns: columns
          });
        }
      }

      // Get views
      const { data: views } = await supabaseAdmin
        .from('information_schema.views')
        .select('table_name')
        .eq('table_schema', 'public');

      if (views) {
        this.analysis.schema.views = views.map(v => v.table_name);
        console.log(`   👁️  Found ${views.length} views`);
      }

      // Get functions
      const { data: functions } = await supabaseAdmin
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_schema', 'public');

      if (functions) {
        this.analysis.schema.functions = functions;
        console.log(`   ⚙️  Found ${functions.length} functions`);
      }

      console.log('   ✅ Schema analysis complete');
      
    } catch (error) {
      console.log('   ❌ Schema analysis failed:', error.message);
      this.analysis.schema.error = error.message;
    }
  }

  async analyzeData() {
    console.log('3️⃣ Analyzing Data Content...');
    
    try {
      for (const table of this.analysis.schema.tables) {
        // Get row count
        const { count, error: countError } = await supabaseAdmin
          .from(table.name)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          this.analysis.data.tableCounts[table.name] = count;
        }

        // Get sample data (first 3 rows)
        const { data: sampleData, error: sampleError } = await supabaseAdmin
          .from(table.name)
          .select('*')
          .limit(3);

        if (!sampleError && sampleData && sampleData.length > 0) {
          this.analysis.data.sampleData[table.name] = sampleData;
        }
      }

      const totalRows = Object.values(this.analysis.data.tableCounts)
        .reduce((sum, count) => sum + (count || 0), 0);
      
      console.log(`   📈 Total rows across all tables: ${totalRows}`);
      console.log('   ✅ Data analysis complete');
      
    } catch (error) {
      console.log('   ❌ Data analysis failed:', error.message);
      this.analysis.data.error = error.message;
    }
  }

  async analyzeSecurity() {
    console.log('4️⃣ Analyzing Security Configuration...');
    
    try {
      // Get RLS policies
      const { data: policies, error: policiesError } = await supabaseAdmin
        .from('pg_policies')
        .select('tablename, policyname, permissive, roles, cmd, qual, with_check');

      if (!policiesError && policies) {
        this.analysis.security.rlsPolicies = policies;
        console.log(`   🔒 Found ${policies.length} RLS policies`);
      }

      // Check if RLS is enabled on tables
      for (const table of this.analysis.schema.tables) {
        try {
          const { data: rlsData } = await supabaseAdmin
            .from('pg_class')
            .select('relname, relrowsecurity')
            .eq('relname', table.name);

          if (rlsData && rlsData.length > 0) {
            table.rlsEnabled = rlsData[0].relrowsecurity;
          }
        } catch (e) {
          // Continue on error
        }
      }

      console.log('   ✅ Security analysis complete');
      
    } catch (error) {
      console.log('   ❌ Security analysis failed:', error.message);
      this.analysis.security.error = error.message;
    }
  }

  async analyzeStorage() {
    console.log('5️⃣ Analyzing Storage Configuration...');
    
    try {
      // List storage buckets
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

      if (!bucketsError && buckets) {
        this.analysis.storage.buckets = buckets;
        console.log(`   🗄️  Found ${buckets.length} storage buckets`);

        // Get files in each bucket (sample)
        for (const bucket of buckets) {
          try {
            const { data: files } = await supabaseAdmin.storage
              .from(bucket.name)
              .list('', { limit: 10 });

            if (files) {
              bucket.sampleFiles = files;
              bucket.fileCount = files.length;
            }
          } catch (e) {
            // Continue on error
          }
        }
      }

      console.log('   ✅ Storage analysis complete');
      
    } catch (error) {
      console.log('   ❌ Storage analysis failed:', error.message);
      this.analysis.storage.error = error.message;
    }
  }

  async analyzePerformance() {
    console.log('6️⃣ Analyzing Performance & Indexes...');
    
    try {
      // Get indexes
      const { data: indexes, error: indexError } = await supabaseAdmin
        .from('pg_indexes')
        .select('tablename, indexname, indexdef')
        .eq('schemaname', 'public');

      if (!indexError && indexes) {
        this.analysis.performance.indexes = indexes;
        console.log(`   📊 Found ${indexes.length} indexes`);
      }

      // Get constraints
      const { data: constraints } = await supabaseAdmin
        .from('information_schema.table_constraints')
        .select('table_name, constraint_name, constraint_type')
        .eq('table_schema', 'public');

      if (constraints) {
        this.analysis.performance.constraints = constraints;
        console.log(`   🔗 Found ${constraints.length} constraints`);
      }

      console.log('   ✅ Performance analysis complete');
      
    } catch (error) {
      console.log('   ❌ Performance analysis failed:', error.message);
      this.analysis.performance.error = error.message;
    }
  }

  async analyzeGaps() {
    console.log('7️⃣ Analyzing Implementation Gaps...');
    
    // Expected tables based on TypeScript types
    const expectedTables = [
      'profiles', 'organizations', 'projects', 'storytellers', 'transcripts',
      'stories', 'media_assets', 'galleries', 'photos', 'photo_tags',
      'ai_processing_queue', 'analytics_events', 'content_recommendations'
    ];

    const existingTables = this.analysis.schema.tables.map(t => t.name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    this.analysis.missingComponents = [
      ...missingTables.map(table => ({
        type: 'table',
        name: table,
        priority: this.getTablePriority(table)
      }))
    ];

    // Check for missing storage buckets
    const expectedBuckets = ['profile-images', 'media-assets', 'transcripts'];
    const existingBuckets = this.analysis.storage.buckets?.map(b => b.name) || [];
    const missingBuckets = expectedBuckets.filter(bucket => !existingBuckets.includes(bucket));
    
    this.analysis.missingComponents.push(
      ...missingBuckets.map(bucket => ({
        type: 'bucket',
        name: bucket,
        priority: 'high'
      }))
    );

    console.log(`   ⚠️  Found ${this.analysis.missingComponents.length} missing components`);
    console.log('   ✅ Gap analysis complete');
  }

  getTablePriority(tableName) {
    const highPriority = ['profiles', 'organizations', 'storytellers', 'transcripts'];
    const mediumPriority = ['stories', 'media_assets', 'galleries'];
    
    if (highPriority.includes(tableName)) return 'high';
    if (mediumPriority.includes(tableName)) return 'medium';
    return 'low';
  }

  async generateReport() {
    console.log('8️⃣ Generating Comprehensive Report...');
    
    const reportPath = path.join(__dirname, '..', 'docs', 'LIVE_DATABASE_ANALYSIS_2025.json');
    
    // Add recommendations
    this.analysis.recommendations = this.generateRecommendations();
    
    // Write detailed JSON report
    fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
    
    // Generate markdown summary
    const summaryPath = path.join(__dirname, '..', 'docs', 'LIVE_DATABASE_STATUS_REPORT.md');
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(summaryPath, markdownReport);
    
    console.log(`   📄 Reports generated:`);
    console.log(`      - JSON: ${reportPath}`);
    console.log(`      - Summary: ${summaryPath}`);
    
    // Print quick summary to console
    this.printSummary();
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Priority recommendations based on analysis
    if (this.analysis.missingComponents.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'schema',
        title: 'Deploy Missing Database Tables',
        description: `${this.analysis.missingComponents.filter(c => c.type === 'table').length} critical tables are missing from the database schema.`,
        action: 'Run schema migration scripts to create missing tables'
      });
    }

    if (this.analysis.security.rlsPolicies.length === 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        title: 'Implement Row Level Security',
        description: 'No RLS policies detected. This is a critical security gap.',
        action: 'Deploy comprehensive RLS policies for data protection'
      });
    }

    if (!this.analysis.storage.buckets || this.analysis.storage.buckets.length === 0) {
      recommendations.push({
        priority: 'high',
        category: 'storage',
        title: 'Configure Storage Buckets',
        description: 'No storage buckets found for media management.',
        action: 'Create and configure storage buckets for profiles, media, and transcripts'
      });
    }

    return recommendations;
  }

  generateMarkdownReport() {
    const report = `# Live Database Status Report - Empathy Ledger
Generated: ${this.analysis.timestamp}

## 🔍 Executive Summary

### Connection Status
${this.analysis.connection?.status === 'success' ? '✅ **CONNECTED**' : '❌ **CONNECTION FAILED**'}
- URL: ${SUPABASE_URL}
- Project ID: yvnuayzslukamizrlhwb

### Database Health
- **Tables**: ${this.analysis.schema.tables.length} deployed
- **Data Rows**: ${Object.values(this.analysis.data.tableCounts).reduce((sum, count) => sum + (count || 0), 0)} total
- **Storage Buckets**: ${this.analysis.storage.buckets?.length || 0}
- **RLS Policies**: ${this.analysis.security.rlsPolicies?.length || 0}
- **Missing Components**: ${this.analysis.missingComponents.length}

## 📊 Schema Analysis

### Existing Tables
${this.analysis.schema.tables.map(table => 
  `- **${table.name}** (${table.columns.length} columns) - ${this.analysis.data.tableCounts[table.name] || 0} rows`
).join('\n')}

### Missing Critical Tables
${this.analysis.missingComponents
  .filter(c => c.type === 'table' && c.priority === 'high')
  .map(c => `- ❌ **${c.name}** (Priority: ${c.priority})`)
  .join('\n') || 'None detected'}

## 🔒 Security Status

### RLS Policies
${this.analysis.security.rlsPolicies?.length > 0 ? 
  `✅ ${this.analysis.security.rlsPolicies.length} policies active` : 
  '❌ **NO RLS POLICIES DETECTED - CRITICAL SECURITY GAP**'}

### Table Security
${this.analysis.schema.tables.map(table => 
  `- **${table.name}**: RLS ${table.rlsEnabled ? '✅ Enabled' : '❌ Disabled'}`
).join('\n')}

## 🗄️ Storage Analysis

### Buckets
${this.analysis.storage.buckets?.length > 0 ?
  this.analysis.storage.buckets.map(bucket => 
    `- **${bucket.name}** (${bucket.public ? 'Public' : 'Private'}) - ${bucket.fileCount || 0} files`
  ).join('\n') :
  '❌ **NO STORAGE BUCKETS CONFIGURED**'}

## 🚨 Priority Recommendations

${this.analysis.recommendations.map(rec => 
  `### ${rec.priority.toUpperCase()}: ${rec.title}
${rec.description}
**Action Required**: ${rec.action}
`).join('\n')}

## 📈 Next Steps

1. **Immediate** (Critical Security):
   - Deploy RLS policies for data protection
   - Configure authentication system
   
2. **High Priority** (Core Functionality):
   - Create missing database tables
   - Set up storage buckets and policies
   - Deploy photo gallery system
   
3. **Medium Priority** (Enhanced Features):
   - Implement AI processing queue
   - Set up analytics and recommendations
   - Configure advanced media management

---
*Report generated by Live Database Analysis Tool*
`;

    return report;
  }

  printSummary() {
    console.log('\n📋 QUICK SUMMARY');
    console.log('==================');
    console.log(`🔗 Connection: ${this.analysis.connection?.status === 'success' ? '✅ Active' : '❌ Failed'}`);
    console.log(`📊 Tables: ${this.analysis.schema.tables.length} deployed`);
    console.log(`📈 Total Rows: ${Object.values(this.analysis.data.tableCounts).reduce((sum, count) => sum + (count || 0), 0)}`);
    console.log(`🔒 RLS Policies: ${this.analysis.security.rlsPolicies?.length || 0}`);
    console.log(`🗄️ Storage Buckets: ${this.analysis.storage.buckets?.length || 0}`);
    console.log(`⚠️ Missing Components: ${this.analysis.missingComponents.length}`);
    
    if (this.analysis.recommendations.length > 0) {
      console.log('\n🚨 TOP RECOMMENDATIONS:');
      this.analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.priority.toUpperCase()}: ${rec.title}`);
      });
    }
  }
}

// Run the analysis
async function main() {
  const analyzer = new DatabaseAnalyzer();
  await analyzer.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseAnalyzer;