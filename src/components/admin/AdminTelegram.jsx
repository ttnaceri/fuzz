export default function AdminTelegram() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Telegram & Support</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Xabarlar</h3>
          <div style={{ padding: '0.8rem', borderBottom: '1px solid #48201a', backgroundColor: '#19100e' }}>
            <div style={{ color: '#f5eeee', fontSize: '0.9rem' }}>Foydalanuvchi 1</div>
            <div style={{ color: '#b9a6a2', fontSize: '0.8rem' }}>Yordam bering...</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ color: '#f5eeee', marginBottom: '1rem' }}>Chat Oynasi</h3>
          <div style={{ flex: 1, border: '1px solid #48201a', borderRadius: '4px', padding: '1rem', minHeight: '300px' }}>
            <p style={{ color: '#b9a6a2', textAlign: 'center', marginTop: '100px' }}>Xabarni tanlang...</p>
          </div>
        </div>
      </div>
    </div>
  );
}