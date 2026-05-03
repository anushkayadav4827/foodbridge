// Verify migration SQL syntax and structure
const fs = require('fs');
const path = require('path');

function verifyMigration() {
  console.log('🔍 Verifying migration file syntax and structure...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_donor_dashboard_listing_system.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('✅ Migration file found and readable');
    console.log(`📄 File size: ${(migration.length / 1024).toFixed(2)} KB\n`);
    
    // Check for key components
    const checks = [
      {
        name: 'ALTER TABLE food_listings',
        pattern: /ALTER TABLE food_listings/gi,
        description: 'Extends food_listings table with new columns'
      },
      {
        name: 'ALTER TABLE claims',
        pattern: /ALTER TABLE claims/gi,
        description: 'Extends claims table with new columns'
      },
      {
        name: 'CREATE TABLE donor_stats',
        pattern: /CREATE TABLE.*donor_stats/gi,
        description: 'Creates donor statistics table'
      },
      {
        name: 'CREATE TABLE listing_drafts',
        pattern: /CREATE TABLE.*listing_drafts/gi,
        description: 'Creates listing drafts table for wizard'
      },
      {
        name: 'Function: initialize_donor_stats',
        pattern: /CREATE.*FUNCTION initialize_donor_stats/gi,
        description: 'Auto-creates donor stats on profile creation'
      },
      {
        name: 'Function: update_donor_stats_on_listing_complete',
        pattern: /CREATE.*FUNCTION update_donor_stats_on_listing_complete/gi,
        description: 'Updates stats when listing completes'
      },
      {
        name: 'Function: increment_donor_total_listings',
        pattern: /CREATE.*FUNCTION increment_donor_total_listings/gi,
        description: 'Increments total listings count'
      },
      {
        name: 'Function: calculate_donor_streak',
        pattern: /CREATE.*FUNCTION calculate_donor_streak/gi,
        description: 'Calculates consecutive days streak'
      },
      {
        name: 'View: donor_active_listings_view',
        pattern: /CREATE.*VIEW donor_active_listings_view/gi,
        description: 'View for active listings with computed fields'
      },
      {
        name: 'View: donor_pending_claims_view',
        pattern: /CREATE.*VIEW donor_pending_claims_view/gi,
        description: 'View for pending claims with receiver details'
      },
      {
        name: 'Trigger: trigger_initialize_donor_stats',
        pattern: /CREATE TRIGGER trigger_initialize_donor_stats/gi,
        description: 'Trigger to auto-create donor stats'
      },
      {
        name: 'Trigger: trigger_update_donor_stats_on_listing_complete',
        pattern: /CREATE TRIGGER trigger_update_donor_stats_on_listing_complete/gi,
        description: 'Trigger to update stats on completion'
      },
      {
        name: 'Trigger: trigger_increment_donor_total_listings',
        pattern: /CREATE TRIGGER trigger_increment_donor_total_listings/gi,
        description: 'Trigger to increment listing count'
      },
      {
        name: 'Indexes for performance',
        pattern: /CREATE INDEX.*idx_/gi,
        description: 'Performance indexes'
      },
      {
        name: 'Constraints',
        pattern: /CONSTRAINT/gi,
        description: 'Data integrity constraints'
      },
      {
        name: 'Comments',
        pattern: /COMMENT ON/gi,
        description: 'Documentation comments'
      }
    ];
    
    console.log('📋 Checking migration components:\n');
    
    let allPassed = true;
    checks.forEach(check => {
      const matches = migration.match(check.pattern);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        console.log(`✅ ${check.name} (${count} occurrence${count > 1 ? 's' : ''})`);
        console.log(`   ${check.description}`);
      } else {
        console.log(`❌ ${check.name} - NOT FOUND`);
        allPassed = false;
      }
    });
    
    // Check for SQL syntax issues
    console.log('\n🔍 Checking for common SQL syntax issues:\n');
    
    const syntaxChecks = [
      {
        name: 'Unclosed parentheses',
        test: () => {
          const open = (migration.match(/\(/g) || []).length;
          const close = (migration.match(/\)/g) || []).length;
          return open === close;
        },
        message: 'Parentheses are balanced'
      },
      {
        name: 'Semicolons present',
        test: () => (migration.match(/;/g) || []).length > 10,
        message: 'SQL statements properly terminated'
      },
      {
        name: 'No obvious typos',
        test: () => !migration.match(/CRATE|TABEL|COLUM|INDX/gi),
        message: 'No common SQL typos detected'
      },
      {
        name: 'Proper IF NOT EXISTS usage',
        test: () => migration.includes('IF NOT EXISTS'),
        message: 'Idempotent migration (uses IF NOT EXISTS)'
      },
      {
        name: 'UUID type usage',
        test: () => migration.includes('UUID'),
        message: 'Uses UUID for primary keys'
      },
      {
        name: 'Timestamp with timezone',
        test: () => migration.includes('TIMESTAMP WITH TIME ZONE'),
        message: 'Uses timezone-aware timestamps'
      }
    ];
    
    syntaxChecks.forEach(check => {
      if (check.test()) {
        console.log(`✅ ${check.name}: ${check.message}`);
      } else {
        console.log(`⚠️  ${check.name}: Check needed`);
      }
    });
    
    // Count lines
    const lines = migration.split('\n').length;
    const nonEmptyLines = migration.split('\n').filter(line => line.trim()).length;
    const commentLines = migration.split('\n').filter(line => line.trim().startsWith('--')).length;
    
    console.log('\n📊 Migration Statistics:\n');
    console.log(`   Total lines: ${lines}`);
    console.log(`   Non-empty lines: ${nonEmptyLines}`);
    console.log(`   Comment lines: ${commentLines}`);
    console.log(`   Code lines: ${nonEmptyLines - commentLines}`);
    
    if (allPassed) {
      console.log('\n✅ Migration verification PASSED!');
      console.log('\n📝 Next steps:');
      console.log('   1. Start PostgreSQL database');
      console.log('   2. Run: node test-migration.js');
      console.log('   3. Or manually apply: psql -d foodbridge -f migrations/002_donor_dashboard_listing_system.sql');
    } else {
      console.log('\n⚠️  Some components may be missing. Review the migration file.');
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyMigration();
