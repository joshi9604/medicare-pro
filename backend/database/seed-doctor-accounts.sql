-- ============================================
-- Add Sample Account Information for Demo Doctors
-- ============================================

-- This script adds sample bank account details to existing doctors
-- Run this ONLY if you want demo/test data in your database

-- First, let's see what doctors we have
SELECT id, "userId" FROM doctors;

-- ============================================
-- Update Doctor 1 (if exists)
-- ============================================
UPDATE doctors 
SET 
  "accountHolderName" = 'Dr. Rajesh Kumar',
  "accountNumber" = '30012345678901',
  "ifscCode" = 'SBIN0001234',
  "bankName" = 'State Bank of India',
  "branchName" = 'Connaught Place Branch',
  "upiId" = 'rajesh.kumar@oksbi'
WHERE id IN (SELECT id FROM doctors LIMIT 1);

-- ============================================
-- Update Doctor 2 (if exists)
-- ============================================
UPDATE doctors 
SET 
  "accountHolderName" = 'Dr. Priya Sharma',
  "accountNumber" = '50012345678902',
  "ifscCode" = 'HDFC0001235',
  "bankName" = 'HDFC Bank',
  "branchName" = 'Mumbai Central Branch',
  "upiId" = 'priya.sharma@okhdfcbank'
WHERE id IN (SELECT id FROM doctors OFFSET 1 LIMIT 1);

-- ============================================
-- Verify the updates
-- ============================================
SELECT 
  d.id,
  u.name AS doctor_name,
  u.email,
  d."accountHolderName",
  d."accountNumber",
  d."ifscCode",
  d."bankName",
  d."branchName",
  d."upiId"
FROM doctors d
JOIN users u ON d."userId" = u.id
WHERE d."accountHolderName" IS NOT NULL;
