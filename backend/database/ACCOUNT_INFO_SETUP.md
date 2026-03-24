# Doctor Account Information - Database Setup Guide

## ✅ Already Completed:

1. **Migration Run Ho Gaya** - Columns add ho chuke hain database mein
2. **Backend Route Ready** - `/api/doctors/profile/account`
3. **Frontend Component Ready** - AccountInformation form

## 📋 Database Columns Added:

The following columns have been added to the `doctors` table:

| Column Name | Type | Required | Description |
|------------|------|----------|-------------|
| accountHolderName | VARCHAR(255) | Yes | Bank account holder name |
| accountNumber | VARCHAR(50) | Yes | Bank account number (8-18 digits) |
| ifscCode | VARCHAR(20) | Yes | IFSC code (e.g., SBIN0001234) |
| bankName | VARCHAR(255) | Yes | Bank name |
| branchName | VARCHAR(255) | No | Branch name (optional) |
| upiId | VARCHAR(100) | No | UPI ID (optional) |

## 🔍 How to Verify in PostgreSQL:

### Option 1: Using pgAdmin
1. Open pgAdmin
2. Connect to `medicare_pro` database
3. Navigate to: Schemas → Tables → doctors
4. Right-click → Properties → Columns
5. You should see all 6 new columns

### Option 2: Using SQL Query
Run this query in pgAdmin's Query Tool:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctors' 
  AND column_name IN (
    'accountHolderName', 
    'accountNumber', 
    'ifscCode', 
    'bankName', 
    'branchName', 
    'upiId'
  );
```

### Option 3: Using Command Line (if psql installed)
```bash
psql -U postgres -d medicare_pro -c "\d doctors"
```

## 📝 Optional: Add Sample Data

If you want to add test/demo data for existing doctors:

1. Open pgAdmin
2. Connect to `medicare_pro` database
3. Open Query Tool
4. Copy and paste content from: `seed-doctor-accounts.sql`
5. Click Execute (F5)

## 🎯 Feature Workflow:

1. **Admin approves doctor** → `isApproved = true`
2. **Doctor logs in** → Goes to Dashboard
3. **Clicks "Account Information" tab** → Form appears
4. **Fills details** → Validates IFSC & account number
5. **Submits** → Saves to database
6. **Can update anytime** → Edit and resubmit

## ✅ Validation Rules:

- **IFSC Code**: Must match pattern `[A-Z]{4}0[A-Z0-9]{6}` (e.g., SBIN0001234)
- **Account Number**: 8-18 digits
- **Required Fields**: accountHolderName, accountNumber, ifscCode, bankName

## 🚀 Testing the Feature:

1. Login as doctor (approved account)
2. Go to Dashboard
3. Click "Account Information" tab
4. Fill the form with test data:
   - Account Holder: Dr. Test User
   - Account Number: 123456789012
   - IFSC Code: SBIN0001234
   - Bank Name: State Bank of India
   - Branch: Test Branch
   - UPI ID: test@oksbi
5. Click Submit
6. Should show success message ✅

## 📁 Files Created:

- `backend/models/Doctor.js` - Updated model
- `backend/routes/doctors.js` - Added account route
- `backend/migrations/add-doctor-account-fields.js` - Migration script
- `backend/database/verify-doctor-account-columns.sql` - Verification query
- `backend/database/seed-doctor-accounts.sql` - Sample data script
- `frontend/src/components/doctor/AccountInformation.jsx` - Form component
- `frontend/src/components/doctor/AccountInformation.css` - Styles
- `frontend/src/pages/doctor/DoctorDashboard.jsx` - Updated with tabs

## ❓ Troubleshooting:

### If columns not showing:
Run the migration again:
```bash
cd backend
node migrations\add-doctor-account-fields.js
```

### If frontend error:
Check browser console for errors
Make sure backend server is running on port 5000

### If validation fails:
- Check IFSC format (uppercase, correct pattern)
- Check account number length (8-18 digits)
- Make sure all required fields are filled

## 🎉 That's It!

No need to manually add anything to PostgreSQL unless you want sample data. The feature is ready to use! Doctors can now add their bank account information through the UI.
