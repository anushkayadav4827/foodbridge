// Test script for donor dashboard listing system migration
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testMigration() {
  let client, client2;
  
  try {
    client = await pool.connect();
    console.log('🔍 Testing database connection...');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    
    console.log('\n📋 Checking if initial schema exists...');
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'food_listings', 'claims')
      ORDER BY table_name
    `);
    
    if (tablesCheck.rows.length === 0) {
      console.log('⚠️  Initial schema not found. Running initial migration...');
      const initialMigration = fs.readFileSync(
        path.join(__dirname, 'migrations', '001_initial_schema.sql'),
        'utf8'
      );
      await client.query(initialMigration);
      console.log('✅ Initial schema created');
    } else {
      console.log('✅ Initial schema exists:', tablesCheck.rows.map(r => r.table_name).join(', '));
    }
    
    console.log('\n🚀 Adding enum value (separate transaction)...');
    const enumMigration = fs.readFileSync(
      path.join(__dirname, 'migrations', '002a_add_enum_value.sql'),
      'utf8'
    );
    await client.query(enumMigration);
    console.log('✅ Enum value added');
    
    // Release and get a new client for the next transaction
    client.release();
    client2 = await pool.connect();
    
    console.log('\n🚀 Running donor dashboard listing system migration...');
    const migration = fs.readFileSync(
      path.join(__dirname, 'migrations', '002_donor_dashboard_listing_system.sql'),
      'utf8'
    );
    
    await client2.query(migration);
    console.log('✅ Migration executed successfully');
    
    console.log('\n🔍 Verifying new tables...');
    
    // Check donor_stats table
    const donorStatsCheck = await client2.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'donor_stats'
      ORDER BY ordinal_position
    `);
    console.log('\n✅ donor_stats table columns:', donorStatsCheck.rows.length);
    donorStatsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check listing_drafts table
    const draftsCheck = await client2.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'listing_drafts'
      ORDER BY ordinal_position
    `);
    console.log('\n✅ listing_drafts table columns:', draftsCheck.rows.length);
    draftsCheck.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check new columns in food_listings
    const listingsNewColumns = await client2.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'food_listings'
        AND column_name IN (
          'cover_photo_url', 
          'pickup_latitude', 
          'pickup_longitude',
          'pickup_instructions',
          'best_before',
          'preparation_notes',
          'is_kosher',
          'is_gluten_free'
        )
      ORDER BY column_name
    `);
    console.log('\n✅ New columns in food_listings:', listingsNewColumns.rows.length);
    listingsNewColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check new columns in claims
    const claimsNewColumns = await client2.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'claims'
        AND column_name IN ('message', 'rejection_reason')
      ORDER BY column_name
    `);
    console.log('\n✅ New columns in claims:', claimsNewColumns.rows.length);
    claimsNewColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check functions
    const functionsCheck = await client2.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
        AND routine_name IN (
          'initialize_donor_stats',
          'update_donor_stats_on_listing_complete',
          'increment_donor_total_listings',
          'calculate_donor_streak'
        )
      ORDER BY routine_name
    `);
    console.log('\n✅ Functions created:', functionsCheck.rows.length);
    functionsCheck.rows.forEach(fn => {
      console.log(`   - ${fn.routine_name}()`);
    });
    
    // Check views
    const viewsCheck = await client2.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
        AND table_name IN (
          'donor_active_listings_view',
          'donor_pending_claims_view'
        )
      ORDER BY table_name
    `);
    console.log('\n✅ Views created:', viewsCheck.rows.length);
    viewsCheck.rows.forEach(view => {
      console.log(`   - ${view.table_name}`);
    });
    
    // Check triggers
    const triggersCheck = await client2.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public'
        AND trigger_name IN (
          'trigger_initialize_donor_stats',
          'trigger_update_donor_stats_on_listing_complete',
          'trigger_increment_donor_total_listings',
          'update_listing_drafts_updated_at'
        )
      ORDER BY trigger_name
    `);
    console.log('\n✅ Triggers created:', triggersCheck.rows.length);
    triggersCheck.rows.forEach(trigger => {
      console.log(`   - ${trigger.trigger_name} on ${trigger.event_object_table}`);
    });
    
    // Check indexes
    const indexesCheck = await client2.query(`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public'
        AND indexname LIKE '%donor%' OR indexname LIKE '%draft%'
      ORDER BY indexname
    `);
    console.log('\n✅ Indexes created:', indexesCheck.rows.length);
    indexesCheck.rows.forEach(idx => {
      console.log(`   - ${idx.indexname} on ${idx.tablename}`);
    });
    
    console.log('\n✅ Migration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Tables: donor_stats, listing_drafts`);
    console.log(`   - Extended tables: food_listings, claims`);
    console.log(`   - Functions: ${functionsCheck.rows.length}`);
    console.log(`   - Views: ${viewsCheck.rows.length}`);
    console.log(`   - Triggers: ${triggersCheck.rows.length}`);
    console.log(`   - Indexes: ${indexesCheck.rows.length}`);
    
  } catch (error) {
    console.error('\n❌ Migration test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    try {
      if (client && !client._ending) client.release();
    } catch (e) {
      // Already released
    }
    try {
      if (client2 && !client2._ending) client2.release();
    } catch (e) {
      // Already released
    }
    await pool.end();
  }
}

testMigration();
