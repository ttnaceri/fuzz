export default function AdminUsers() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Foydalanuvchilar</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>Username</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
            <td style={{ padding: '1rem' }}>1</td>
            <td style={{ padding: '1rem' }}>admin</td>
            <td style={{ padding: '1rem' }}>admin@fuzz.store</td>
            <td style={{ padding: '1rem', color: '#43b581' }}>SuperAdmin</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}