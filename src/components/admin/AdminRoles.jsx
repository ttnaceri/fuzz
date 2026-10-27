import { useState } from 'react';
import useToast from '../hooks/useToast.js';

const DEFAULT_ROLES = [
  { id: 1, name: 'Admin', permissions: { manage_games: true, manage_users: true, upload_html: true, manage_roles: true } },
  { id: 2, name: 'HTML Developer', permissions: { manage_games: true, manage_users: false, upload_html: true, manage_roles: false } },
  { id: 3, name: 'Moderator', permissions: { manage_games: false, manage_users: true, upload_html: false, manage_roles: false } },
];

export default function AdminRoles() {
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const { success } = useToast();

  const togglePermission = (roleId, permKey) => {
    setRoles(roles.map(r => {
      if (r.id === roleId) {
        return { ...r, permissions: { ...r.permissions, [permKey]: !r.permissions[permKey] } };
      }
      return r;
    }));
    success("Ruxsat o'zgartirildi");
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Rollar va Ruxsatlar</h1>
      </div>
      <p className="text-muted mb-2">Foydalanuvchilarga qanday huquqlar berishni shu yerda boshqaring. (Hozircha frontend demo)</p>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {roles.map(role => (
          <div key={role.id} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>{role.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={role.permissions.manage_games} onChange={() => togglePermission(role.id, 'manage_games')} id={`${role.id}-games`} style={{ width: 20, height: 20 }} />
                <label htmlFor={`${role.id}-games`} style={{ cursor: 'pointer' }}>O'yinlarni boshqarish</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={role.permissions.upload_html} onChange={() => togglePermission(role.id, 'upload_html')} id={`${role.id}-html`} style={{ width: 20, height: 20 }} />
                <label htmlFor={`${role.id}-html`} style={{ cursor: 'pointer' }}>HTML o'yin yuklash</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={role.permissions.manage_users} onChange={() => togglePermission(role.id, 'manage_users')} id={`${role.id}-users`} style={{ width: 20, height: 20 }} />
                <label htmlFor={`${role.id}-users`} style={{ cursor: 'pointer' }}>Foydalanuvchilarni boshqarish</label>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={role.permissions.manage_roles} onChange={() => togglePermission(role.id, 'manage_roles')} id={`${role.id}-roles`} style={{ width: 20, height: 20 }} />
                <label htmlFor={`${role.id}-roles`} style={{ cursor: 'pointer' }}>Rol va ruxsatlarni boshqarish</label>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}