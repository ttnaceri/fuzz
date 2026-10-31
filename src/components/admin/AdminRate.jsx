export default function AdminRate() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Valyuta Kurslari (Rates)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>USD Kursi</div>
          <div style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>12,500 UZS</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>EUR Kursi</div>
          <div style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>13,200 UZS</div>
        </div>
      </div>
      <button style={{ padding: '0.6rem 1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Kursni Tahrirlash</button>
    </div>
  );
}