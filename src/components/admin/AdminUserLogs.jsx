export default function AdminUserLogs() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Foydalanuvchilar Tarixi (User Logs)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>User</th>
            <th style={{ padding: '1rem' }}>Amal</th>
            <th style={{ padding: '1rem' }}>Vaqt</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
            <td style={{ padding: '1rem' }}>husniddin</td>
            <td style={{ padding: '1rem' }}>Tizimga kirdi</td>
            <td style={{ padding: '1rem' }}>2026-10-29 14:00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}