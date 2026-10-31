export default function AdminPlatform() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Platforma Moliyasi</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Umumiy Tushum</div>
          <div style={{ color: '#43b581', fontSize: '1.5rem', fontWeight: 'bold' }}>$15,420.50</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Qaytarilgan Pullar</div>
          <div style={{ color: '#ed5555', fontSize: '1.5rem', fontWeight: 'bold' }}>$1,200.00</div>
        </div>
        <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Sof Foyda</div>
          <div style={{ color: '#f5eeee', fontSize: '1.5rem', fontWeight: 'bold' }}>$14,220.50</div>
        </div>
      </div>
    </div>
  );
}