export default function TopicLoading() {
  return (
    <div className="animate-pulse" style={{ maxWidth: 840, margin: '0 auto', padding: '26px 26px 90px' }}>
      <div style={{ marginBottom: 20, height: 16, width: 120, borderRadius: 6, background: '#EFEDE6' }} />
      <div style={{ marginBottom: 24, height: 32, width: '60%', borderRadius: 8, background: '#EFEDE6' }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            marginBottom: 14,
            height: 88,
            borderRadius: 18,
            background: '#fff',
            border: '1.5px solid rgba(0,0,0,.07)',
          }}
        />
      ))}
    </div>
  );
}
