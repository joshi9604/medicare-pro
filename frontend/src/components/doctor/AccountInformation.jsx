import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertTriangle, Building2, CheckCircle2, CreditCard, Landmark, Lock, Save, ShieldAlert, User } from 'lucide-react';
import './AccountInformation.css';

export default function AccountInformation({ doctor }) {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasAccountInfo, setHasAccountInfo] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        accountHolderName: doctor.accountHolderName || '',
        accountNumber: doctor.accountNumber || '',
        ifscCode: doctor.ifscCode || '',
        bankName: doctor.bankName || '',
        branchName: doctor.branchName || '',
        upiId: doctor.upiId || ''
      });
      setHasAccountInfo(!!doctor.accountHolderName && !!doctor.accountNumber);
    }
  }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { data } = await axios.put('/api/doctors/profile/account', formData);

      if (data.success) {
        toast.success('Account information updated successfully');
        setHasAccountInfo(true);
      }
    } catch (err) {
      console.error('Account update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update account information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!doctor?.isApproved) {
    return (
      <div className="account-info-page">
        <div className="account-info-card">
          <div className="account-info-icon"><ShieldAlert size={34} /></div>
          <h3 className="account-info-title">Awaiting Admin Approval</h3>
          <p className="account-info-text">
            Your doctor profile is pending admin approval. Once approved, you will be able to add your account information here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-info-page">
      <div className="account-info-header">
        <h1 className="account-info-title"><CreditCard size={24} /> Account Information</h1>
        <div className="account-info-header-actions">
          <p className="account-info-subtitle">Add your bank account details for payment processing.</p>
          <button
            type="button"
            className="account-info-history-btn"
            onClick={() => window.open('/doctor/payments', '_blank')}
          >
            <CreditCard size={16} />
            <span>View Payment History</span>
          </button>
        </div>
      </div>

      {!hasAccountInfo ? (
        <div className="account-info-alert">
          <div className="account-info-alert-icon"><AlertTriangle size={20} /></div>
          <div>
            <strong>Account Information Required</strong>
            <p>Please add your bank account details to receive payments from consultations.</p>
          </div>
        </div>
      ) : (
        <div className="account-info-success">
          <div className="account-info-success-icon"><CheckCircle2 size={20} /></div>
          <div>
            <strong>Account Information Added</strong>
            <p>Your bank account details are on file.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="account-info-form">
        <div className="account-info-grid">
          <div className="account-info-group">
            <label className="account-info-label">
              <User size={14} /> Account Holder Name <span className="required">*</span>
            </label>
            <input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Enter account holder name" required className="account-info-input" />
          </div>

          <div className="account-info-group">
            <label className="account-info-label">
              <CreditCard size={14} /> Account Number <span className="required">*</span>
            </label>
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="Enter account number" required minLength="8" maxLength="18" className="account-info-input" />
          </div>

          <div className="account-info-group">
            <label className="account-info-label">
              <Landmark size={14} /> IFSC Code <span className="required">*</span>
            </label>
            <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="e.g., SBIN0001234" required pattern="[A-Z]{4}0[A-Z0-9]{6}" title="IFSC code format: 4 letters, 0, then 6 alphanumeric characters" style={{ textTransform: 'uppercase' }} className="account-info-input" />
            <small className="account-info-hint">Format: 4 letters + 0 + 6 alphanumeric (e.g., SBIN0001234)</small>
          </div>

          <div className="account-info-group">
            <label className="account-info-label">
              <Building2 size={14} /> Bank Name <span className="required">*</span>
            </label>
            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="e.g., State Bank of India" required className="account-info-input" />
          </div>

          <div className="account-info-group">
            <label className="account-info-label">
              <Building2 size={14} /> Branch Name
            </label>
            <input type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="e.g., New Delhi Main Branch" className="account-info-input" />
          </div>

          <div className="account-info-group">
            <label className="account-info-label">
              <CreditCard size={14} /> UPI ID (Optional)
            </label>
            <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="e.g., yourname@oksbi" className="account-info-input" />
            <small className="account-info-hint">For UPI payments (optional)</small>
          </div>
        </div>

        <div className="account-info-actions">
          <button type="submit" className="account-info-submit-btn" disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save size={16} />
                <span>{hasAccountInfo ? 'Update Account' : 'Save Account Details'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="account-info-security">
        <div className="account-info-security-icon"><Lock size={20} /></div>
        <p>Your bank account information is encrypted and stored securely. It is only used for processing consultation payments.</p>
      </div>
    </div>
  );
}
