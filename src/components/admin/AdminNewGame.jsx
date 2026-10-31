export default function AdminNewGame() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Yangi O'yin Qo'shish</h1>
      <div style={{ backgroundColor: '#241411', padding: '1.5rem', borderRadius: '8px', border: '1px solid #48201a', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>O'yin Nomi</label>
          <input type="text" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: '#b9a6a2', marginBottom: '0.5rem' }}>Narxi (USD)</label>
          <input type="number" style={{ width: '100%', padding: '0.8rem', backgroundColor: '#100b0a', border: '1px solid #48201a', color: '#fff', borderRadius: '4px' }} />
        </div>
        <button style={{ padding: '0.8rem 1.5rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>O'yinni Saqlash</button>
      </div>
    </div>
  );
}