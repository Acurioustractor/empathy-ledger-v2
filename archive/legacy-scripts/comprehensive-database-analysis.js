#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://yvnuayzslukamizrlhwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNTI2MTIsImV4cCI6MjAzOTkyODYxMn0.ojDyC8v18uE9xcWHy9ygng_2n18ioHi';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNDM1MjYxMiwiZXhwIjoyMDM5OTI4NjEyfQ.3UiSfzbq-ZMQNshQ27x-Ow_Mk27_642';

// Initialize clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class DatabaseAnalyzer {
  constructor() {
    this.analysis = {
      timestamp: new Date().toISOString(),
      project_id: 'yvnuayzslukamizrlhwb',
      summary: {},
      schema: {},
      rls_policies: {},
      storage: {},
      auth: {},
      functions: {},
      data_quality: {},
      performance: {},
      cultural_compliance: {},
      recommendations: []
    };
  }

  async runCompleteAnalysis() {
    console.log('🔍 Starting comprehensive Supabase database analysis...');
    console.log(`📊 Project ID: ${this.analysis.project_id}`);
    console.log(`⏰ Analysis started at: ${this.analysis.timestamp}`);
    
    try {
      // Test connection first
      await this.testConnection();
      
      // Run all analysis modules
      await this.analyzeSchema();
      await this.analyzeRLSPolicies();
      await this.analyzeStorage();
      await this.analyzeAuth();
      await this.analyzeFunctions();
      await this.analyzeDataQuality();
      await this.analyzePerformance();
      await this.analyzeCulturalCompliance();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Save analysis report
      this.saveAnalysisReport();
      
      console.log('✅ Analysis completed successfully!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    console.log('🔗 Testing database connection...');
    
    try {
      // Test anon client
      const { data: anonTest, error: anonError } = await anonClient
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);

      // Test admin client with a more permissive query
      const { data: adminTest, error: adminError } = await adminClient.rpc('version');
      
      this.analysis.summary.connection_status = {
        anon_client: anonError ? 'failed' : 'success',
        admin_client: adminError ? 'failed' : 'success',
        anon_error: anonError?.message,
        admin_error: adminError?.message
      };
      
      console.log('✅ Connection test completed');
      
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      this.analysis.summary.connection_status = {
        error: error.message,
        status: 'failed'
      };
    }
  }

  async analyzeSchema() {
    console.log('📋 Analyzing database schema...');
    
    try {
      // Get all tables
      const { data: tables, error: tablesError } = await adminClient
        .rpc('get_table_info');
      
      if (tablesError && tablesError.message.includes('function get_table_info() does not exist')) {
        // Fallback to direct query
        const { data: fallbackTables, error: fallbackError } = await adminClient
          .from('information_schema.tables')
          .select('table_name, table_schema')
          .eq('table_schema', 'public');
        
        if (fallbackTables) {
          this.analysis.schema.tables = await this.getDetailedTableInfo(fallbackTables);
        } else {
          this.analysis.schema.tables_error = fallbackError?.message;
        }
      } else if (!tablesError && tables) {
        this.analysis.schema.tables = tables;
      } else {
        this.analysis.schema.tables_error = tablesError?.message;
      }
      
      // Get columns for each table
      await this.analyzeTableColumns();
      
      // Check for indexes
      await this.analyzeIndexes();
      
      // Check foreign keys
      await this.analyzeForeignKeys();
      
      console.log('✅ Schema analysis completed');
      
    } catch (error) {
      console.error('❌ Schema analysis failed:', error.message);
      this.analysis.schema.error = error.message;
    }
  }

  async getDetailedTableInfo(tables) {
    const detailed = [];
    
    for (const table of tables) {
      if (table.table_schema === 'public') {
        try {
          // Get column info
          const { data: columns, error } = await adminClient
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', table.table_name)
            .eq('table_schema', 'public');
          
          if (!error && columns) {
            detailed.push({
              table_name: table.table_name,
              columns: columns,
              column_count: columns.length
            });
          }
        } catch (err) {
          console.log(`⚠️  Could not get columns for ${table.table_name}: ${err.message}`);
        }
      }
    }
    
    return detailed;
  }

  async analyzeTableColumns() {
    try {
      const { data: columns, error } = await adminClient
        .from('information_schema.columns')
        .select('table_name, column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public');
      
      if (!error && columns) {
        this.analysis.schema.columns = columns;
        
        // Group by table
        const columnsByTable = {};
        columns.forEach(col => {
          if (!columnsByTable[col.table_name]) {
            columnsByTable[col.table_name] = [];
          }
          columnsByTable[col.table_name].push(col);
        });
        
        this.analysis.schema.columns_by_table = columnsByTable;
        
        // Look for cultural fields
        const culturalColumns = columns.filter(col => 
          col.column_name.toLowerCase().includes('cultural') ||
          col.column_name.toLowerCase().includes('elder') ||
          col.column_name.toLowerCase().includes('indigenous') ||
          col.column_name.toLowerCase().includes('consent') ||
          col.column_name.toLowerCase().includes('privacy')
        );
        
        this.analysis.schema.cultural_columns = culturalColumns;
      } else {
        this.analysis.schema.columns_error = error?.message;
      }
    } catch (error) {
      this.analysis.schema.columns_error = error.message;
    }
  }

  async analyzeIndexes() {
    try {
      const { data: indexes, error } = await adminClient
        .from('pg_indexes')
        .select('tablename, indexname, indexdef')
        .eq('schemaname', 'public');
      
      if (!error && indexes) {
        this.analysis.schema.indexes = indexes;
        this.analysis.schema.index_count = indexes.length;
      } else {
        this.analysis.schema.indexes_error = error?.message;
      }
    } catch (error) {
      this.analysis.schema.indexes_error = error.message;
    }
  }

  async analyzeForeignKeys() {
    try {
      const { data: fkeys, error } = await adminClient.rpc('get_foreign_keys');
      
      if (error && error.message.includes('function get_foreign_keys() does not exist')) {
        // Use direct SQL query as fallback
        const { data: fallbackFkeys, error: fallbackError } = await adminClient
          .from('information_schema.key_column_usage')
          .select('table_name, column_name, constraint_name')
          .not('referenced_table_name', 'is', null);
        
        this.analysis.schema.foreign_keys = fallbackFkeys || [];
      } else {
        this.analysis.schema.foreign_keys = fkeys || [];
      }
    } catch (error) {
      this.analysis.schema.foreign_keys_error = error.message;
    }
  }

  async analyzeRLSPolicies() {
    console.log('🔒 Analyzing Row Level Security policies...');
    
    try {
      // Get RLS status for tables
      const { data: policies, error } = await adminClient.rpc('get_rls_policies');
      
      if (error && error.message.includes('function get_rls_policies() does not exist')) {
        // Fallback approach
        const { data: tables } = await adminClient
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
        
        if (tables) {
          this.analysis.rls_policies.tables_with_rls = [];
          for (const table of tables) {
            try {
              // Check if RLS is enabled (this might not work with anon key)
              this.analysis.rls_policies.tables_with_rls.push({
                table_name: table.tablename,
                status: 'unknown'
              });
            } catch (err) {
              // Skip if we can't check
            }
          }
        }
      } else if (!error && policies) {
        this.analysis.rls_policies.policies = policies;
      }
      
      console.log('✅ RLS analysis completed');
      
    } catch (error) {
      console.error('❌ RLS analysis failed:', error.message);
      this.analysis.rls_policies.error = error.message;
    }
  }

  async analyzeStorage() {
    console.log('🗄️  Analyzing storage buckets...');
    
    try {
      const { data: buckets, error } = await adminClient.storage.listBuckets();
      
      if (!error && buckets) {
        this.analysis.storage.buckets = buckets;
        this.analysis.storage.bucket_count = buckets.length;
        
        // Analyze each bucket
        for (const bucket of buckets) {
          try {
            const { data: files, error: filesError } = await adminClient.storage
              .from(bucket.name)
              .list('', { limit: 10 });
            
            if (!filesError && files) {
              bucket.sample_files = files;
              bucket.file_count = files.length;
            }
          } catch (err) {
            bucket.files_error = err.message;
          }
        }
      } else {
        this.analysis.storage.error = error?.message;
      }
      
      console.log('✅ Storage analysis completed');
      
    } catch (error) {
      console.error('❌ Storage analysis failed:', error.message);
      this.analysis.storage.error = error.message;
    }
  }

  async analyzeAuth() {
    console.log('🔐 Analyzing authentication setup...');
    
    try {
      // Test auth configuration
      const { data: user, error: userError } = await anonClient.auth.getUser();
      
      this.analysis.auth.current_user = user ? 'authenticated' : 'anonymous';
      this.analysis.auth.auth_error = userError?.message;
      
      // Check auth tables exist
      const authTables = ['users', 'profiles', 'auth.users'];
      for (const tableName of authTables) {
        try {
          const { data, error } = await adminClient
            .from(tableName.replace('auth.', ''))
            .select('count')
            .limit(1);
          
          if (!error) {
            this.analysis.auth[`${tableName}_exists`] = true;
          }
        } catch (err) {
          this.analysis.auth[`${tableName}_exists`] = false;
        }
      }
      
      console.log('✅ Auth analysis completed');
      
    } catch (error) {
      console.error('❌ Auth analysis failed:', error.message);
      this.analysis.auth.error = error.message;
    }
  }

  async analyzeFunctions() {
    console.log('⚡ Analyzing database functions...');
    
    try {
      const { data: functions, error } = await adminClient
        .from('information_schema.routines')
        .select('routine_name, routine_type, data_type')
        .eq('routine_schema', 'public');
      
      if (!error && functions) {
        this.analysis.functions.functions = functions;
        this.analysis.functions.function_count = functions.length;
        
        // Look for cultural/consent related functions
        const culturalFunctions = functions.filter(func =>
          func.routine_name.toLowerCase().includes('cultural') ||
          func.routine_name.toLowerCase().includes('consent') ||
          func.routine_name.toLowerCase().includes('elder') ||
          func.routine_name.toLowerCase().includes('review')
        );
        
        this.analysis.functions.cultural_functions = culturalFunctions;
      } else {
        this.analysis.functions.error = error?.message;
      }
      
      console.log('✅ Functions analysis completed');
      
    } catch (error) {
      console.error('❌ Functions analysis failed:', error.message);
      this.analysis.functions.error = error.message;
    }
  }

  async analyzeDataQuality() {
    console.log('📊 Analyzing data quality...');
    
    try {
      const tables = this.analysis.schema.tables || [];
      const dataQuality = {};
      
      for (const table of tables) {
        if (table.table_name) {
          try {
            // Get row count
            const { count, error } = await adminClient
              .from(table.table_name)
              .select('*', { count: 'exact', head: true });
            
            if (!error) {
              dataQuality[table.table_name] = {
                row_count: count,
                status: count > 0 ? 'has_data' : 'empty'
              };
              
              // Sample a few records if data exists
              if (count > 0) {
                const { data: sample, error: sampleError } = await adminClient
                  .from(table.table_name)
                  .select('*')
                  .limit(3);
                
                if (!sampleError && sample) {
                  dataQuality[table.table_name].sample_records = sample.length;
                  dataQuality[table.table_name].sample_data = sample;
                }
              }
            }
          } catch (err) {
            dataQuality[table.table_name] = {
              error: err.message,
              status: 'error'
            };
          }
        }
      }
      
      this.analysis.data_quality = dataQuality;
      
      console.log('✅ Data quality analysis completed');
      
    } catch (error) {
      console.error('❌ Data quality analysis failed:', error.message);
      this.analysis.data_quality.error = error.message;
    }
  }

  async analyzePerformance() {
    console.log('🚀 Analyzing performance metrics...');
    
    try {
      // Basic performance indicators
      this.analysis.performance = {
        connection_test_time: Date.now(),
        total_tables: this.analysis.schema.tables?.length || 0,
        total_indexes: this.analysis.schema.index_count || 0,
        total_buckets: this.analysis.storage.bucket_count || 0,
        analysis_timestamp: new Date().toISOString()
      };
      
      console.log('✅ Performance analysis completed');
      
    } catch (error) {
      console.error('❌ Performance analysis failed:', error.message);
      this.analysis.performance.error = error.message;
    }
  }

  async analyzeCulturalCompliance() {
    console.log('🏛️  Analyzing cultural compliance...');
    
    try {
      const compliance = {
        cultural_columns_found: this.analysis.schema.cultural_columns?.length || 0,
        cultural_functions_found: this.analysis.functions.cultural_functions?.length || 0,
        consent_tracking: false,
        elder_review_system: false,
        privacy_controls: false
      };
      
      // Check for specific cultural compliance indicators
      const culturalColumns = this.analysis.schema.cultural_columns || [];
      
      compliance.consent_tracking = culturalColumns.some(col =>
        col.column_name.toLowerCase().includes('consent')
      );
      
      compliance.elder_review_system = culturalColumns.some(col =>
        col.column_name.toLowerCase().includes('elder')
      );
      
      compliance.privacy_controls = culturalColumns.some(col =>
        col.column_name.toLowerCase().includes('privacy')
      );
      
      // Cultural safety score (0-100)
      let score = 0;
      if (compliance.consent_tracking) score += 25;
      if (compliance.elder_review_system) score += 25;
      if (compliance.privacy_controls) score += 25;
      if (compliance.cultural_functions_found > 0) score += 25;
      
      compliance.cultural_safety_score = score;
      compliance.compliance_level = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low';
      
      this.analysis.cultural_compliance = compliance;
      
      console.log('✅ Cultural compliance analysis completed');
      
    } catch (error) {
      console.error('❌ Cultural compliance analysis failed:', error.message);
      this.analysis.cultural_compliance.error = error.message;
    }
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');
    
    const recommendations = [];
    
    // Schema recommendations
    if (!this.analysis.schema.tables || this.analysis.schema.tables.length === 0) {
      recommendations.push({
        category: 'schema',
        priority: 'critical',
        title: 'Database Schema Missing',
        description: 'No tables found in the database. Core schema needs to be deployed.',
        action: 'Run database initialization scripts'
      });
    }
    
    // Cultural compliance recommendations
    const culturalScore = this.analysis.cultural_compliance?.cultural_safety_score || 0;
    if (culturalScore < 75) {
      recommendations.push({
        category: 'cultural',
        priority: culturalScore < 25 ? 'critical' : 'high',
        title: 'Cultural Compliance Enhancement Needed',
        description: `Cultural safety score is ${culturalScore}/100. Missing key cultural protection features.`,
        action: 'Implement consent tracking, elder review system, and privacy controls'
      });
    }
    
    // Storage recommendations
    if (!this.analysis.storage.buckets || this.analysis.storage.buckets.length === 0) {
      recommendations.push({
        category: 'storage',
        priority: 'high',
        title: 'Storage Buckets Not Configured',
        description: 'No storage buckets found for media management.',
        action: 'Set up storage buckets for photos, videos, and documents'
      });
    }
    
    // Performance recommendations
    const tableCount = this.analysis.schema.tables?.length || 0;
    const indexCount = this.analysis.schema.index_count || 0;
    if (tableCount > 0 && indexCount < tableCount * 2) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        title: 'Insufficient Database Indexes',
        description: `Only ${indexCount} indexes found for ${tableCount} tables. More indexes needed for performance.`,
        action: 'Add indexes on frequently queried columns'
      });
    }
    
    // Data quality recommendations
    const dataQuality = this.analysis.data_quality;
    if (dataQuality && Object.keys(dataQuality).length > 0) {
      const emptyTables = Object.entries(dataQuality)
        .filter(([_, info]) => info.status === 'empty')
        .length;
      
      if (emptyTables > 0) {
        recommendations.push({
          category: 'data',
          priority: 'medium',
          title: 'Empty Tables Detected',
          description: `${emptyTables} tables have no data. Consider data migration or seeding.`,
          action: 'Review empty tables and populate with initial data if needed'
        });
      }
    }
    
    this.analysis.recommendations = recommendations;
    
    console.log(`✅ Generated ${recommendations.length} recommendations`);
  }

  saveAnalysisReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-database-analysis-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'docs', filename);
    
    // Ensure docs directory exists
    const docsDir = path.dirname(filepath);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(this.analysis, null, 2));
    
    console.log(`📄 Analysis report saved to: ${filepath}`);
    
    // Also create a summary report
    this.generateSummaryReport(filepath);
  }

  generateSummaryReport(jsonFilepath) {
    const summaryPath = jsonFilepath.replace('.json', '-SUMMARY.md');
    
    const summary = `# Comprehensive Supabase Database Analysis Summary

**Project ID:** ${this.analysis.project_id}
**Analysis Date:** ${this.analysis.timestamp}
**Database URL:** ${SUPABASE_URL}

## 🔍 Analysis Overview

### Connection Status
- **Anonymous Client:** ${this.analysis.summary.connection_status?.anon_client || 'unknown'}
- **Admin Client:** ${this.analysis.summary.connection_status?.admin_client || 'unknown'}

### Database Schema
- **Tables Found:** ${this.analysis.schema.tables?.length || 0}
- **Total Columns:** ${this.analysis.schema.columns?.length || 0}
- **Indexes:** ${this.analysis.schema.index_count || 0}
- **Foreign Keys:** ${this.analysis.schema.foreign_keys?.length || 0}

### Cultural Compliance
- **Cultural Safety Score:** ${this.analysis.cultural_compliance?.cultural_safety_score || 0}/100
- **Compliance Level:** ${this.analysis.cultural_compliance?.compliance_level || 'unknown'}
- **Cultural Columns:** ${this.analysis.cultural_compliance?.cultural_columns_found || 0}
- **Consent Tracking:** ${this.analysis.cultural_compliance?.consent_tracking ? '✅' : '❌'}
- **Elder Review System:** ${this.analysis.cultural_compliance?.elder_review_system ? '✅' : '❌'}
- **Privacy Controls:** ${this.analysis.cultural_compliance?.privacy_controls ? '✅' : '❌'}

### Storage
- **Buckets Configured:** ${this.analysis.storage.bucket_count || 0}
- **Storage Status:** ${this.analysis.storage.buckets ? 'configured' : 'needs setup'}

### Data Quality
${Object.keys(this.analysis.data_quality || {}).length > 0 ? 
  Object.entries(this.analysis.data_quality)
    .map(([table, info]) => `- **${table}:** ${info.row_count || 0} rows (${info.status})`)
    .join('\n') 
  : '- No data quality assessment available'}

## 🚨 Critical Recommendations

${this.analysis.recommendations
  ?.filter(rec => rec.priority === 'critical')
  ?.map(rec => `### ${rec.title}\n**Category:** ${rec.category}\n**Description:** ${rec.description}\n**Action:** ${rec.action}\n`)
  ?.join('\n') || 'No critical issues found'}

## ⚠️ High Priority Recommendations

${this.analysis.recommendations
  ?.filter(rec => rec.priority === 'high')
  ?.map(rec => `### ${rec.title}\n**Category:** ${rec.category}\n**Description:** ${rec.description}\n**Action:** ${rec.action}\n`)
  ?.join('\n') || 'No high priority issues found'}

## 📋 Medium Priority Recommendations

${this.analysis.recommendations
  ?.filter(rec => rec.priority === 'medium')
  ?.map(rec => `### ${rec.title}\n**Category:** ${rec.category}\n**Description:** ${rec.description}\n**Action:** ${rec.action}\n`)
  ?.join('\n') || 'No medium priority issues found'}

## 📊 Detailed Analysis

For complete technical details, see the full JSON report: \`${path.basename(jsonFilepath)}\`

---

*Analysis generated by Empathy Ledger Database Analyzer*
*${this.analysis.timestamp}*
`;

    fs.writeFileSync(summaryPath, summary);
    console.log(`📋 Summary report saved to: ${summaryPath}`);
  }
}

// Run the analysis
async function main() {
  const analyzer = new DatabaseAnalyzer();
  await analyzer.runCompleteAnalysis();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseAnalyzer;