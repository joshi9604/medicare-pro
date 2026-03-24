const { sequelize } = require('../config/database');

// Migration to add account information fields to doctors table
async function migrate() {
  try {
    console.log('🔧 Starting migration: Adding account information fields to doctors table...');

    // Add new columns
    await sequelize.query(`
      ALTER TABLE doctors 
      ADD COLUMN IF NOT EXISTS "accountHolderName" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "accountNumber" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "ifscCode" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "bankName" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "branchName" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "upiId" VARCHAR(100);
    `);

    console.log('✅ Migration completed successfully!');
    console.log('📝 Added columns:');
    console.log('   - accountHolderName');
    console.log('   - accountNumber');
    console.log('   - ifscCode');
    console.log('   - bankName');
    console.log('   - branchName');
    console.log('   - upiId');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
