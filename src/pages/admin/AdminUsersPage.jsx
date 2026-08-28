import { useEffect, useState, useCallback } from 'react';
import { MdSearch, MdPersonAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { getUsers, updateUser, deleteUser } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonTable } from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: 20, search: search || undefined, role: roleFilter || undefined });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || {});
    } catch { } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await updateUser(editUser.id, { name: editUser.name, role: editUser.role, isActive: editUser.isActive });
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage all registered users and their roles.</p>
        </div>
      </div>

      <div className="card mb-4" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <strong>How User Management works</strong>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.6, margin: '6px 0 0' }}>
          Search accounts, review resident or collector roles, activate or deactivate access, and edit account details. Business tools are separate tools for residents managing commercial waste.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: '14px 20px' }}>
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <div className="input-group" style={{ flex: '1 1 220px' }}>
            <span className="input-icon"><MdSearch /></span>
            <input type="text" className="form-control" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-control" style={{ flex: '0 1 160px' }} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="resident">Resident</option>
            <option value="collector">Collector</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : users.length === 0 ? (
        <div className="card"><EmptyState title="No users found" message="Try adjusting your search filters." /></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Zone</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{u.email}</td>
                    <td><StatusBadge status={u.role} /></td>
                    <td style={{ fontSize: 13 }}>{u.zone?.name || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-icon" title="Edit" onClick={() => setEditUser({ ...u })}>
                          <MdEdit size={16} />
                        </button>
                        <button className="btn btn-ghost btn-icon" title="Delete" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(u.id)}>
                          <MdDelete size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {pagination.total} total users
              </span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <button className="btn btn-ghost btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="modal-backdrop" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit User — {editUser.name}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setEditUser(null)}><MdClose /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={editUser.role} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))}>
                <option value="resident">Resident</option>
                <option value="collector">Collector</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="form-control" value={editUser.isActive ? 'true' : 'false'} onChange={e => setEditUser(u => ({ ...u, isActive: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
