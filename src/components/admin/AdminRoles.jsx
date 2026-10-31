export default function AdminRoles() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Rollar (Roles)</h1>
      <button style={{ padding: '0.6rem 1rem', backgroundColor: '#8a1200', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '1rem' }}>Yangi Rol Yaratish</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#8a1200', margin: 0 }}>SuperAdmin</h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginTop: '0.5rem' }}>Barcha huquqlarga ega</p>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
          <h3 style={{ color: '#f5eeee', margin: 0 }}>Moderator</h3>
          <p style={{ color: '#b9a6a2', fontSize: '0.8rem', marginTop: '0.5rem' }}>Faqat userlarni boshqarish</p>
        </div>
      </div>
    </div>
  );
}