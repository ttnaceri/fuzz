export default function AdminPermissions() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Ruxsatlar Matritsasi (Permissions)</h1>
      <p style={{ color: '#b9a6a2', marginBottom: '1rem' }}>Rollar uchun ruxsatlarni sozlash.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2' }}>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Ruxsatlar</th>
            <th style={{ padding: '1rem' }}>SuperAdmin</th>
            <th style={{ padding: '1rem' }}>Moderator</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
            <td style={{ padding: '1rem' }}>Foydalanuvchilarni boshqarish</td>
            <td style={{ padding: '1rem', textAlign: 'center', color: '#43b581' }}>✅</td>
            <td style={{ padding: '1rem', textAlign: 'center', color: '#43b581' }}>✅</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
            <td style={{ padding: '1rem' }}>Server sozlamalari</td>
            <td style={{ padding: '1rem', textAlign: 'center', color: '#43b581' }}>✅</td>
            <td style={{ padding: '1rem', textAlign: 'center', color: '#ed5555' }}>❌</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}