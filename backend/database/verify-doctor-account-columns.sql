-- ============================================
-- Verify Doctor Account Information Columns
-- ============================================

-- Check if columns exist in doctors table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'doctors' 
  AND column_name IN (
    'accountHolderName', 
    'accountNumber', 
    'ifscCode', 
    'bankName', 
    'branchName', 
    'upiId'
  )
ORDER BY ordinal_position;

-- ============================================
-- Sample Data Update (Optional)
-- ============================================

-- Example: Update an existing doctor's account information
-- Uncomment and modify the doctor ID and details as needed

/*
UPDATE doctors 
SET 
  "accountHolderName" = 'Dr. John Doe',
  "accountNumber" = '1234567890123',
  "ifscCode" = 'SBIN0001234',
  "bankName" = 'State Bank of India',
  "branchName" = 'New Delhi Main Branch',
  "upiId" = 'john.doe@oksbi'
WHERE id = 'YOUR_DOCTOR_ID_HERE';
*/

-- ============================================
-- View All Doctors with Account Info
-- ============================================

-- See which doctors have added account information
SELECT 
  d.id,
  u.name AS doctor_name,
  u.email,
  d."isApproved",
  d."accountHolderName",
  d."accountNumber",
  d."ifscCode",
  d."bankName",
  d."branchName",
  d."upiId",
  CASE 
    WHEN d."accountHolderName" IS NOT NULL AND d."accountNumber" IS NOT NULL THEN '✅ Added'
    ELSE '❌ Not Added'
  END AS account_status
FROM doctors d
JOIN users u ON d."userId" = u.id
ORDER BY d."createdAt" DESC;
