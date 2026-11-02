export default function AdminServer() {
  return (
    <div>
      <h1 style={{ color: '#f5eeee', marginBottom: '1.5rem' }}>Server Status</h1>
      <div style={{ backgroundColor: '#241411', padding: '1rem', borderRadius: '8px', border: '1px solid #48201a' }}>
        <p style={{ color: '#43b581', fontWeight: 'bold' }}>✅ Cloudflare Worker: Ishlayapti</p>
        <p style={{ color: '#43b581', fontWeight: 'bold' }}>✅ D1 Database: Ulangan</p>
        <p style={{ color: '#43b581', fontWeight: 'bold' }}>✅ Telegram Bot: Faol</p>
      </div>
    </div>
  );
}