export default function AdminServer() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Server Status</h1>
      <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #48201a', paddingBottom: '0.5rem' }}>
          <span style={{ color: '#b9a6a2' }}>Xizmatlar Holati</span>
          <span style={{ color: '#43b581' }}>Barchasi Ishlayapti</span>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: '#f5eeee', marginBottom: '0.2rem' }}>CPU: 45%</div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#100b0a', borderRadius: '4px' }}><div style={{ width: '45%', height: '100%', backgroundColor: '#8a1200', borderRadius: '4px' }}></div></div>
        </div>
        <div>
          <div style={{ color: '#f5eeee', marginBottom: '0.2rem' }}>RAM: 62%</div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#100b0a', borderRadius: '4px' }}><div style={{ width: '62%', height: '100%', backgroundColor: '#f0b44d', borderRadius: '4px' }}></div></div>
        </div>
      </div>
    </div>
  );
}