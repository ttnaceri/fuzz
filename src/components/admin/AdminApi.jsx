export default function AdminApi() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>API Integratsiyalar</h1>
      <button style={{ padding: '0.6rem 1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}>Yangi API Key Yaratish</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
        <thead>
          <tr style={{ backgroundColor: '#19100e', color: '#b9a6a2', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>API Key (Yashirin)</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Amallar</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #48201a', color: '#f5eeee' }}>
            <td style={{ padding: '1rem' }}>fz_live_*********************</td>
            <td style={{ padding: '1rem', color: '#43b581' }}>Faol</td>
            <td style={{ padding: '1rem' }}><button style={{ color: '#ed5555', background: 'none', border: 'none', cursor: 'pointer' }}>O'chirish</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}