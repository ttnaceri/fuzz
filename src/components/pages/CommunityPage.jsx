export default function CommunityPage() {
  return (
    <div className="page">
      <h1 className="page-title">Community</h1>
      <p className="text-muted">Community features (discussions, activity, friends) require a backend.</p>
      <div className="game-grid mt-2">
        {[
          { to: '/discussions', icon: 'fa-comments', label: 'Discussions' },
          { to: '/activity', icon: 'fa-stream', label: 'Activity' },
          { to: '/friends', icon: 'fa-user-group', label: 'Friends' },
          { to: '/groups', icon: 'fa-users-rectangle', label: 'Groups' },
          { to: '/reviews', icon: 'fa-star', label: 'Reviews' },
          { to: '/news', icon: 'fa-newspaper', label: 'News' },
        ].map((l) => (
          <a key={l.to} href={l.to} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <i className={`fa-solid ${l.icon}`} style={{ fontSize: '2rem', color: 'var(--color-primary)' }} />
            <div style={{ fontWeight: 700, marginTop: '0.5rem' }}>{l.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}