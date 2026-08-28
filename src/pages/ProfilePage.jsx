import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { MdPerson, MdEdit, MdLock, MdSave, MdLocationOn, MdStar, MdEmojiEvents, MdPhotoCamera, MdRoute } from 'react-icons/md';
import { FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile, updateMyPreferences, updateMyPassword, getZones, getLgas, uploadAvatar, upgradeToCollector } from '../api';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const BADGE_INFO = {
  quiz_recycling: { icon: '♻️', label: 'Recycling Expert' },
  quiz_environment: { icon: '🌿', label: 'Eco Warrior' },
  quiz_master: { icon: '🏆', label: 'Quiz Master' },
};

function getBadgeInfo(badge) {
  for (const [key, info] of Object.entries(BADGE_INFO)) {
    if (badge.includes(key)) return info;
  }
  return { icon: '🎖️', label: badge.replace(/_/g, ' ').replace(/quiz /i, '') };
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { theme, fontFamily, fontSize, setPreferences } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [zones, setZones] = useState([]);
  const [stateLgas, setStateLgas] = useState([]);
  const locationInitialized = useRef(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [displayPrefs, setDisplayPrefs] = useState({
    theme: theme || user?.theme || 'light',
    fontFamily: fontFamily || user?.fontFamily || 'Inter',
    fontSize: Number(fontSize || user?.fontSize || 16),
  });

  useEffect(() => {
    getZones().then(r => setZones(r.data.zones || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setAvatarPreview(user?.avatarUrl || '');
  }, [user?.avatarUrl]);

  useEffect(() => {
    setDisplayPrefs({
      theme: theme || user?.theme || 'light',
      fontFamily: fontFamily || user?.fontFamily || 'Inter',
      fontSize: Number(fontSize || user?.fontSize || 16),
    });
  }, [theme, fontFamily, fontSize, user?.theme, user?.fontFamily, user?.fontSize]);

  const { register: regProfile, handleSubmit: handleProfile, watch: watchProfile, setValue: setProfileValue, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone || '',
      address: user?.address || '',
      state: user?.state || '',
      lga: user?.lga || '',
      zoneId: user?.zoneId || '',
      theme: user?.theme || theme,
      fontFamily: user?.fontFamily || fontFamily,
      fontSize: user?.fontSize || fontSize,
    },
  });

  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const profileZone = zones.find(zone => String(zone.id) === String(data.zoneId));
      const res = await updateMyProfile({
        name: data.name,
        phone: data.phone,
        address: data.address,
        state: profileZone?.state || data.state || undefined,
        lga: profileZone?.lga || data.lga || undefined,
        zoneId: profileZone?.id || null,
      });
      updateUser(res.data.user);
      setPreferences({ theme: data.theme, fontFamily: data.fontFamily, fontSize: Number(data.fontSize) });
      setEditMode(false);
      toast.success('Profile updated');
    } catch (err) {
      const validationMessage = err.response?.data?.errors?.map((item) => item.message).join(', ');
      toast.error(validationMessage || err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const onAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      toast.error('Choose an image smaller than 2 MB');
      return;
    }
    try {
      const response = await uploadAvatar(file);
      setAvatarPreview(response.data.user.avatarUrl || '');
      updateUser(response.data.user);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload profile photo');
    } finally {
      event.target.value = '';
    }
  };

  const selectedState = watchProfile('state');
  const selectedLga = watchProfile('lga');
  const selectedZoneId = watchProfile('zoneId');
  const selectedZone = zones.find(zone => String(zone.id) === String(selectedZoneId));

  useEffect(() => {
    if (!selectedState) { setStateLgas([]); return; }
    getLgas(selectedState).then((response) => setStateLgas(response.data.lgas || [])).catch(() => setStateLgas([]));
    if (!locationInitialized.current) {
      locationInitialized.current = true;
      return;
    }
    setProfileValue('zoneId', '');
    setProfileValue('lga', '');
  }, [selectedState, setProfileValue]);

  useEffect(() => {
    if (selectedZoneId && (!selectedZone || selectedZone.state !== selectedState || selectedZone.lga !== selectedLga)) {
      setProfileValue('zoneId', '');
    }
  }, [selectedLga, selectedState, selectedZone, selectedZoneId, setProfileValue]);

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await updateMyPassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPw();
      setShowPwForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const badges = user?.badges || [];
  const points = user?.points || 0;
  const level = points < 100 ? 'Beginner 🌱' : points < 300 ? 'Eco Learner 🌿' : points < 600 ? 'Green Champion 💚' : points < 1000 ? 'Recycling Hero ♻️' : 'Eco Legend 🏆';
  const nextLevelTarget = points < 100 ? 100 : points < 300 ? 300 : points < 600 ? 600 : points < 1000 ? 1000 : points + 200;
  const progressWidth = Math.min(100, (points / nextLevelTarget) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account, view your eco points and badges.</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-heading)',
              }}>
                {avatarPreview ? <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.email}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <StatusBadge status={user?.role} />
                  {user?.state && <span className="badge badge-green">{user.state}</span>}
                </div>
                <label className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', marginTop: 10, cursor: 'pointer' }}>
                  <MdPhotoCamera /> Change photo
                  <input type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleProfile(onSaveProfile)} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className={`form-control ${profileErrors.name ? 'error' : ''}`}
                    {...regProfile('name', { required: 'Name is required' })} />
                  {profileErrors.name && <p className="form-error">{profileErrors.name.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" placeholder="+234 801 234 5678" {...regProfile('phone')} />
                </div>

                <div className="form-group">
                  <label className="form-label">Home Address</label>
                  <input type="text" className="form-control" placeholder="14 Broad Street, Lagos Island" {...regProfile('address')} />
                </div>

                <div className="grid-2" style={{ gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">State</label>
                    <select className="form-control" {...regProfile('state')}>
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">LGA</label>
                    <select className="form-control" {...regProfile('lga')} disabled={!selectedState}>
                      <option value="">{selectedState ? 'Select LGA' : 'Select a state first'}</option>
                      {stateLgas.map((lga) => <option key={lga} value={lga}>{lga}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group mt-2">
                  <label className="form-label">Collection Zone</label>
                  <select className="form-control" {...regProfile('zoneId')}>
                    <option value="">Select your zone</option>
                    {zones.filter(z => z.state === selectedState && (!selectedLga || z.lga === selectedLga)).map(z => <option key={z.id} value={z.id}>{z.name} ({z.code})</option>)}
                  </select>
                </div>

                <div className="flex gap-3 mt-3">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone || '—' },
                  { label: 'Address', value: user?.address || '—' },
                  { label: 'State', value: user?.state || '—' },
                  { label: 'LGA', value: user?.lga || '—' },
                  { label: 'Zone', value: zones.find(z => z.id === user?.zoneId)?.name || '—' },
                  { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                ].map(field => (
                  <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{field.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{field.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user?.role === 'resident' && (
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="card-header"><h3 className="card-title"><MdRoute style={{ marginRight: 8, verticalAlign: 'middle' }} />Become a Collector</h3></div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                Upgrade this account to access assigned pickups, collection history, earnings and withdrawals.
              </p>
              <button className="btn btn-primary" disabled={upgrading} onClick={async () => {
                if (!confirm('Upgrade your account to a collector account?')) return;
                setUpgrading(true);
                try {
                  const response = await upgradeToCollector();
                  updateUser(response.data.user);
                  toast.success('Account upgraded to collector');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Could not upgrade account');
                } finally { setUpgrading(false); }
              }}>
                <MdRoute /> {upgrading ? 'Upgrading...' : 'Upgrade to Collector'}
              </button>
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3 className="card-title">Display Preferences</h3></div>
            <form onSubmit={async (event) => {
              event.preventDefault();
              setSaving(true);
              try {
                const nextPreferences = {
                  theme: displayPrefs.theme,
                  fontFamily: displayPrefs.fontFamily,
                  fontSize: Number(displayPrefs.fontSize),
                };
                const response = await updateMyPreferences(nextPreferences);
                setPreferences(nextPreferences);
                updateUser(response.data.user);
                toast.success('Display preferences updated');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Unable to save display preferences');
              } finally {
                setSaving(false);
              }
            }}>
              <div className="form-group">
                <label className="form-label">Theme</label>
                <select
                  className="form-control"
                  value={displayPrefs.theme}
                  onChange={(event) => setDisplayPrefs((prev) => ({ ...prev, theme: event.target.value }))}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="forest">Kwara Forest</option>
                  <option value="sunset">Ilorin Sunset</option>
                </select>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Font family</label>
                  <select
                    className="form-control"
                    value={displayPrefs.fontFamily}
                    onChange={(event) => setDisplayPrefs((prev) => ({ ...prev, fontFamily: event.target.value }))}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Nunito">Nunito</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Font size</label>
                  <select
                    className="form-control"
                    value={displayPrefs.fontSize}
                    onChange={(event) => setDisplayPrefs((prev) => ({ ...prev, fontSize: Number(event.target.value) }))}
                  >
                    <option value={14}>Small</option>
                    <option value={16}>Medium</option>
                    <option value={18}>Large</option>
                    <option value={20}>Extra large</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}><MdSave /> {saving ? 'Saving...' : 'Save Preferences'}</button>
                <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Applies instantly</span>
              </div>
            </form>
          </div>

          {/* Security card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MdLock style={{ marginRight: 8, verticalAlign: 'middle' }} />Security</h3>
              {!showPwForm && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPwForm(true)}>
                  <MdEdit /> Change
                </button>
              )}
            </div>

            {showPwForm ? (
              <form onSubmit={handlePw(onChangePassword)} noValidate>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className={`form-control ${pwErrors.currentPassword ? 'error' : ''}`}
                    {...regPw('currentPassword', { required: 'Required' })} />
                  {pwErrors.currentPassword && <p className="form-error">{pwErrors.currentPassword.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className={`form-control ${pwErrors.newPassword ? 'error' : ''}`}
                    {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} />
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
              <div style={{ padding: '12px 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
                🔐 Your password was last changed recently. Keep your account secure!
              </div>
            )}
          </div>
        </div>

        {/* Right column — Points & Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MdEmojiEvents style={{ marginRight: 8, verticalAlign: 'middle' }} />Badges</h3>
            </div>
            {badges.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No badges yet — complete a quiz to unlock your first one.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {badges.map((badge) => {
                  const info = getBadgeInfo(badge);
                  return (
                    <div key={badge} style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: '10px 12px', minWidth: 120, border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: 20 }}>{info.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{info.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points card */}
          <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(46,125,50,0.08), rgba(25,118,210,0.05))' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>
              {points < 100 ? '🌱' : points < 300 ? '🌿' : points < 600 ? '💚' : points < 1000 ? '♻️' : '🏆'}
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
              {points.toLocaleString('en-NG')}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', margin: '4px 0 12px', fontSize: 14 }}>Eco Points</p>
            <div style={{ background: 'var(--color-primary)', color: '#fff', padding: '6px 20px', borderRadius: 'var(--radius-full)', display: 'inline-block', fontSize: 14, fontWeight: 700 }}>
              {level}
            </div>

            {/* Progress to next level */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                <span>Next level</span>
                <span>{points}/{nextLevelTarget}</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${progressWidth}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: 999 }} />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                <span>Level Progress</span>
                <span>{points} / {points < 100 ? 100 : points < 300 ? 300 : points < 600 ? 600 : 1000} pts</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                  borderRadius: 4,
                  width: `${Math.min(100, (points / (points < 100 ? 100 : points < 300 ? 300 : points < 600 ? 600 : 1000)) * 100)}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>

            {/* How to earn points */}
            <div style={{ marginTop: 16, textAlign: 'left', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8 }}>HOW TO EARN POINTS</p>
              {[
                ['🎯', 'Complete quizzes', '+10–75 pts'],
                ['✅', 'Pass a quiz', 'Bonus points'],
                ['🗑️', 'Log waste entries', 'Track impact'],
                ['📝', 'Submit reports', 'Community help'],
              ].map(([icon, action, pts]) => (
                <div key={action} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{icon} {action}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><MdEmojiEvents style={{ marginRight: 8, verticalAlign: 'middle' }} />My Badges</h3>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{badges.length} earned</span>
            </div>

            {badges.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.3 }}>🎖️</div>
                <p style={{ fontSize: 14 }}>No badges yet — complete quizzes to earn your first badge!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {badges.map((badge, i) => {
                  const info = getBadgeInfo(badge);
                  return (
                    <div key={i} style={{
                      textAlign: 'center', padding: '16px 8px',
                      background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{info.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, textTransform: 'capitalize' }}>
                        {info.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nigerian flag accent */}
          <div style={{ height: 6, borderRadius: 4, background: 'linear-gradient(90deg, #008751 33%, #fff 33%, #fff 66%, #008751 66%)', opacity: 0.6 }} />
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>
            🇳🇬 Building a cleaner Nigeria, one pickup at a time
          </p>
        </div>
      </div>
    </div>
  );
}
