export default function AdminBundles() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>O'yin To'plamlari (Bundles)</h1>
      <button style={{ padding: '0.6rem 1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}>Yangi To'plam Yaratish</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', border: '1px solid #48201a', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem' }}>
            <h3 style={{ color: '#f5eeee', margin: '0 0 0.5rem 0' }}>Action Pack</h3>
            <p style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>3 ta o'yin to'plami</p>
            <div style={{ color: '#43b581', fontWeight: 'bold', marginTop: '1rem' }}>$19.99</div>
          </div>
        </div>
      </div>
    </div>
  );
}