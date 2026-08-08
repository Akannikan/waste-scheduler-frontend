import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdPerson, MdEdit, MdLock, MdSave } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, updateMyPassword } from '../api';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register: registerProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '', address: user?.address || '' },
  });

  const { register: registerPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await updateMyProfile(data);
      updateUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await updateMyPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPw();
      setShowPwForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information and settings.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Profile card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><MdPerson style={{ marginRight: 8, verticalAlign: 'middle' }} />Account Information</h3>
            {!editMode && (
              <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>
                <MdEdit /> Edit
              </button>
            )}
          </div>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)',
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.email}</div>
              <div style={{ marginTop: 6 }}><StatusBadge status={user?.role} /></div>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleProfile(onSaveProfile)} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${profileErrors.name ? 'error' : ''}`}
                  {...registerProfile('name', { required: 'Name is required' })}
                />
                {profileErrors.name && <p className="form-error">{profileErrors.name.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-control" {...registerProfile('phone')} />
              </div>

              <div className="form-group">
                <label className="form-label">Home Address</label>
                <input type="text" className="form-control" {...registerProfile('address')} />
              </div>

              <div className="flex gap-3" style={{ marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: user?.phone || '—' },
                { label: 'Address', value: user?.address || '—' },
                { label: 'Role', value: user?.role },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              ].map((field) => (
                <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{field.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{field.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><MdLock style={{ marginRight: 8, verticalAlign: 'middle' }} />Security</h3>
            {!showPwForm && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPwForm(true)}>
                <MdEdit /> Change Password
              </button>
            )}
          </div>

          {showPwForm ? (
            <form onSubmit={handlePw(onChangePassword)} noValidate>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className={`form-control ${pwErrors.currentPassword ? 'error' : ''}`}
                  {...registerPw('currentPassword', { required: 'Current password is required' })}
                />
                {pwErrors.currentPassword && <p className="form-error">{pwErrors.currentPassword.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className={`form-control ${pwErrors.newPassword ? 'error' : ''}`}
                  {...registerPw('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                {pwErrors.newPassword && <p className="form-error">{pwErrors.newPassword.message}</p>}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPwForm(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <MdLock size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>Keep your account secure with a strong password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
