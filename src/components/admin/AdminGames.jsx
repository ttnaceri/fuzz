export default function AdminGames() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>O'yinlar Ro'yxati</h1>
      <button style={{ padding: '0.6rem 1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}>Yangi O'yin Qo'shish</button>
      <div style={{ padding: '1rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a', color: '#b9a6a2' }}>
        O'yinlar backenddan yuklanmoqda...
      </div>
    </div>
  );
}