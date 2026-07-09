export default function TopicsLoading() {
  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '44px 26px 80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              borderRadius: 20,
              minHeight: 172,
              background: '#EFEDE6',
              border: '1.5px solid rgba(0,0,0,.06)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
