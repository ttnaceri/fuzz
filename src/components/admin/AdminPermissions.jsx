export default function AdminPermissions() {
  const permissions = [
    { role: 'SuperAdmin', view: true, create: true, edit: true, delete: true },
    { role: 'Admin', view: true, create: true, edit: true, delete: false },
    { role: 'Moderator', view: true, create: false, edit: true, delete: false },
    { role: 'User', view: true, create: false, edit: false, delete: false },
  ];

  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Permissions Matrix</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Rol</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Ko'rish</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Yaratish</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Tahrirlash</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>O'chirish</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.role}</td>
              <td style={{ padding: '1rem', textAlign: 'center', color: p.view ? '#43b581' : '#ed5555' }}>{p.view ? '✅' : '❌'}</td>
              <td style={{ padding: '1rem', textAlign: 'center', color: p.create ? '#43b581' : '#ed5555' }}>{p.create ? '✅' : '❌'}</td>
              <td style={{ padding: '1rem', textAlign: 'center', color: p.edit ? '#43b581' : '#ed5555' }}>{p.edit ? '✅' : '❌'}</td>
              <td style={{ padding: '1rem', textAlign: 'center', color: p.delete ? '#43b581' : '#ed5555' }}>{p.delete ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}