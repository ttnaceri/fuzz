export default function AdminBackend() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Backend Xizmatlari</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#241411', borderRadius: '8px', border: '1px solid #48201a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#f5eeee', fontWeight: 'bold' }}>Main API (Cloudflare Worker)</span>
            <span style={{ color: '#43b581' }}>Ulangan</span>
          </div>
          <div style={{ color: '#b9a6a2', fontSize: '0.8rem', marginTop: '0.5rem' }}>URL: https://my-backend.updbackend.workers.dev/fuzz</div>
        </div>
      </div>
    </div>
  );
}